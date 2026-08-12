#import <ApphudSdkSpec/ApphudSdkSpec.h>

#import "ApphudRNBridge.h"

#if __has_include(<react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>)
#import <react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>
#else
#import "react_native_apphud_sdk-Swift.h"
#endif

/**
 * Turbo Native Module `ApphudSdkEvents`.
 *
 * Owns the Codegen-generated `emitOn…` methods and hands them to
 * `ApphudSdkEventsImpl` through `ApphudSdkEventsEmitting`, since the generated
 * base class is Obj-C++ and unreachable from Swift.
 */
@interface ApphudSdkEventsModule : NativeApphudSdkEventsSpecBase <
                                       NativeApphudSdkEventsSpec,
                                       ApphudSdkEventsEmitting>
@end

@implementation ApphudSdkEventsModule {
  ApphudSdkEventsImpl *_impl;
  /**
   * The generated emitters call an `std::function` that is empty until
   * `setEventEmitterCallback:` runs. Apphud delegate callbacks can arrive
   * before that, so events are dropped until the callback is installed —
   * the same thing `RCTEventEmitter` did when nobody was listening yet.
   */
  BOOL _canEmit;
}

RCT_EXPORT_MODULE(ApphudSdkEvents)

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [ApphudSdkEventsImpl new];
    _impl.emitter = self;
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper
{
  [super setEventEmitterCallback:eventEmitterCallbackWrapper];
  _canEmit = YES;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeApphudSdkEventsSpecJSI>(params);
}

#pragma mark - NativeApphudSdkEventsSpec

- (void)setApphudProductIdentifiers:(NSArray *)ids
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
  [_impl setApphudProductIdentifiers:ids withResolve:resolve withReject:reject];
}

- (void)setScreenPresentationStyle:(NSString *)style
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject
{
  [_impl setScreenPresentationStyle:style withResolve:resolve withReject:reject];
}

#pragma mark - ApphudSdkEventsEmitting

- (void)emitPlacementsDidFullyLoad:(NSArray *)value
{
  if (_canEmit) {
    [self emitOnPlacementsDidFullyLoad:value];
  }
}

- (void)emitUserDidLoad:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnUserDidLoad:value];
  }
}

- (void)emitApphudDidLoadStoreProducts:(NSArray *)value
{
  if (_canEmit) {
    [self emitOnApphudDidLoadStoreProducts:value];
  }
}

- (void)emitApphudDidChangeUserID:(NSString *)value
{
  if (_canEmit) {
    [self emitOnApphudDidChangeUserID:value];
  }
}

- (void)emitApphudSubscriptionsUpdated:(NSArray *)value
{
  if (_canEmit) {
    [self emitOnApphudSubscriptionsUpdated:value];
  }
}

- (void)emitApphudNonRenewingPurchasesUpdated:(NSArray *)value
{
  if (_canEmit) {
    [self emitOnApphudNonRenewingPurchasesUpdated:value];
  }
}

- (void)emitApphudScreenDidAppear:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudScreenDidAppear:value];
  }
}

- (void)emitApphudDidPurchase:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudDidPurchase:value];
  }
}

- (void)emitApphudWillPurchase:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudWillPurchase:value];
  }
}

- (void)emitApphudDidFailPurchase:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudDidFailPurchase:value];
  }
}

- (void)emitApphudDidSelectSurveyAnswer:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudDidSelectSurveyAnswer:value];
  }
}

- (void)emitApphudRuleScreenDidAppear:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRuleScreenDidAppear:value];
  }
}

- (void)emitApphudRuleWillPurchase:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRuleWillPurchase:value];
  }
}

- (void)emitApphudRulePurchaseCompleted:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRulePurchaseCompleted:value];
  }
}

- (void)emitApphudRuleScreenWillDismiss:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRuleScreenWillDismiss:value];
  }
}

- (void)emitApphudRuleScreenDidDismiss:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRuleScreenDidDismiss:value];
  }
}

- (void)emitApphudRuleDidSelectSurveyAnswer:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRuleDidSelectSurveyAnswer:value];
  }
}

- (void)emitApphudRulePaywallWithoutScreen:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudRulePaywallWithoutScreen:value];
  }
}

- (void)emitApphudDeeplinkAttribution:(NSDictionary *)value
{
  if (_canEmit) {
    [self emitOnApphudDeeplinkAttribution:value];
  }
}

@end
