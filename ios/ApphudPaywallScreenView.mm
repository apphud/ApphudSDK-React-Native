#import <React/RCTConversions.h>
#import <React/RCTViewComponentView.h>

#import <react/renderer/components/ApphudSdkSpec/ComponentDescriptors.h>
#import <react/renderer/components/ApphudSdkSpec/EventEmitters.h>
#import <react/renderer/components/ApphudSdkSpec/Props.h>
#import <react/renderer/components/ApphudSdkSpec/RCTComponentViewHelpers.h>

#import "ApphudRNBridge.h"

#if __has_include(<react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>)
#import <react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>
#else
#import "react_native_apphud_sdk-Swift.h"
#endif

using namespace facebook::react;

/**
 * Fabric component view for `<PaywallScreenView />`.
 *
 * Rendering lives in the Swift `ApphudPaywallScreenContentView`; this class
 * only translates between Fabric props/events and that view. The class name is
 * pinned by `codegenConfig.ios.components` in package.json, because
 * `RCTThirdPartyComponentsProvider` looks it up via `NSClassFromString`.
 */
@interface ApphudPaywallScreenView : RCTViewComponentView <RCTPaywallScreenViewViewProtocol>
@end

@implementation ApphudPaywallScreenView {
  ApphudPaywallScreenContentView *_paywallView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<PaywallScreenViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const PaywallScreenViewProps>();
    _props = defaultProps;

    [self attachPaywallView];
  }
  return self;
}

- (void)attachPaywallView
{
  _paywallView = [ApphudPaywallScreenContentView new];

  __weak __typeof(self) weakSelf = self;

  _paywallView.onStartLoading = ^(NSDictionary *body) {
    [weakSelf emitStartLoading:body];
  };
  _paywallView.onReceiveView = ^(NSDictionary *body) {
    [weakSelf emitReceiveView];
  };
  _paywallView.onLoadingError = ^(NSDictionary *body) {
    [weakSelf emitLoadingError:body];
  };
  _paywallView.onTransactionStarted = ^(NSDictionary *body) {
    [weakSelf emitTransactionStarted:body];
  };
  _paywallView.onTransactionCompleted = ^(NSDictionary *body) {
    [weakSelf emitTransactionCompleted:body];
  };
  _paywallView.onCloseButtonTapped = ^(NSDictionary *body) {
    [weakSelf emitCloseButtonTapped];
  };

  self.contentView = _paywallView;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];

  // The hosted paywall controller cannot be reused, so the recycled view starts
  // over with a fresh content view.
  _paywallView.onStartLoading = nil;
  _paywallView.onReceiveView = nil;
  _paywallView.onLoadingError = nil;
  _paywallView.onTransactionStarted = nil;
  _paywallView.onTransactionCompleted = nil;
  _paywallView.onCloseButtonTapped = nil;
  [_paywallView removeFromSuperview];

  _props = PaywallScreenViewShadowNode::defaultSharedProps();
  [self attachPaywallView];
}

#pragma mark - Props

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<const PaywallScreenViewProps>(_props);
  const auto &newViewProps = *std::static_pointer_cast<const PaywallScreenViewProps>(props);

  BOOL needsReload = NO;

  if (oldViewProps.placementIdentifier != newViewProps.placementIdentifier) {
    _paywallView.placementIdentifier = RCTNSStringFromStringNilIfEmpty(newViewProps.placementIdentifier);
    needsReload = YES;
  }

  const auto &oldOptions = oldViewProps.requestPlacementsOptions;
  const auto &newOptions = newViewProps.requestPlacementsOptions;
  if (oldOptions.maxAttempts != newOptions.maxAttempts || oldOptions.forceRefresh != newOptions.forceRefresh ||
      oldOptions.preferredTimeout != newOptions.preferredTimeout) {
    _paywallView.requestPlacementsOptions = [self dictionaryFromOptions:newOptions];
    needsReload = YES;
  }

  [super updateProps:props oldProps:oldProps];

  if (needsReload) {
    [_paywallView reload];
  }
}

/**
 * Numeric props default to `0` when JS omits them, which is not a usable retry
 * count or timeout, so those keys are left out and the Swift side falls back to
 * its own defaults.
 */
- (NSDictionary *)dictionaryFromOptions:(const PaywallScreenViewRequestPlacementsOptionsStruct &)options
{
  NSMutableDictionary *result = [NSMutableDictionary dictionary];
  result[@"forceRefresh"] = @(options.forceRefresh);
  if (options.maxAttempts > 0) {
    result[@"maxAttempts"] = @(options.maxAttempts);
  }
  if (options.preferredTimeout > 0) {
    result[@"preferredTimeout"] = @(options.preferredTimeout);
  }
  return result;
}

#pragma mark - Commands

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTPaywallScreenViewHandleCommand(self, commandName, args);
}

- (void)reload
{
  [_paywallView reload];
}

#pragma mark - Events

/**
 * Fabric event payloads are statically typed, so the Apphud entities are sent
 * as JSON strings and decoded again in `src/view/PaywallScreenView.tsx`.
 */
- (std::shared_ptr<const PaywallScreenViewEventEmitter>)paywallEventEmitter
{
  if (!_eventEmitter) {
    return nullptr;
  }
  return std::static_pointer_cast<const PaywallScreenViewEventEmitter>(_eventEmitter);
}

- (void)emitStartLoading:(NSDictionary *)body
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onStartLoading({
      .placementIdentifier = RCTStringFromNSString(body[@"placementIdentifier"]),
  });
}

- (void)emitReceiveView
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onReceiveView({});
}

- (void)emitLoadingError:(NSDictionary *)body
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onLoadingError({
      .placementIdentifier = RCTStringFromNSString(body[@"placementIdentifier"]),
      .error = RCTStringFromNSString(ApphudJSONStringFromObject(body[@"error"])),
  });
}

- (void)emitTransactionStarted:(NSDictionary *)body
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onTransactionStarted({
      .result = RCTStringFromNSString(ApphudJSONStringFromObject(body[@"result"])),
  });
}

- (void)emitTransactionCompleted:(NSDictionary *)body
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onTransactionCompleted({
      .result = RCTStringFromNSString(ApphudJSONStringFromObject(body[@"result"])),
  });
}

- (void)emitCloseButtonTapped
{
  auto emitter = [self paywallEventEmitter];
  if (emitter == nullptr) {
    return;
  }
  emitter->onCloseButtonTapped({});
}

@end

Class<RCTComponentViewProtocol> PaywallScreenViewCls(void)
{
  return ApphudPaywallScreenView.class;
}
