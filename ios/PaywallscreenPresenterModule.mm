#import <ApphudSdkSpec/ApphudSdkSpec.h>

#import "ApphudRNBridge.h"

// RN 0.87: React typedefs must be imported before the generated -Swift.h.
#import <React/RCTBridgeModule.h>
#import <React/RCTComponent.h>

#if __has_include(<react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>)
#import <react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>
#else
#import "react_native_apphud_sdk-Swift.h"
#endif

/**
 * Turbo Native Module `PaywallscreenPresenter`.
 *
 * Forwards to `PaywallscreenPresenterImpl` and exposes the Codegen-generated
 * emitters to it through `ApphudPaywallScreenPresenterEmitting`.
 */
@interface PaywallscreenPresenterModule : NativePaywallscreenPresenterSpecBase <
                                              NativePaywallscreenPresenterSpec,
                                              ApphudPaywallScreenPresenterEmitting>
@end

@implementation PaywallscreenPresenterModule {
  PaywallscreenPresenterImpl *_impl;
  BOOL _canEmit;
}

RCT_EXPORT_MODULE(PaywallscreenPresenter)

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [PaywallscreenPresenterImpl new];
    _impl.emitter = self;
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

/// `displayPaywallScreen` is `@MainActor` and presents a view controller.
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper
{
  [super setEventEmitterCallback:eventEmitterCallbackWrapper];
  _canEmit = YES;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativePaywallscreenPresenterSpecJSI>(params);
}

#pragma mark - NativePaywallscreenPresenterSpec

- (void)displayPaywallScreen:(NSDictionary *)options
{
  [_impl displayPaywallScreen:options];
}

#pragma mark - ApphudPaywallScreenPresenterEmitting

- (void)emitPresenterTransactionStarted:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnTransactionStarted:value];
  }
}

- (void)emitPresenterTransactionCompleted:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnTransactionCompleted:value];
  }
}

- (void)emitPresenterCloseButtonTapped:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnCloseButtonTapped:value];
  }
}

- (void)emitPresenterScreenShown:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnScreenShown:value];
  }
}

- (void)emitPresenterError:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnError:value];
  }
}

@end
