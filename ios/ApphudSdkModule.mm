#import <ApphudSdkSpec/ApphudSdkSpec.h>

// RN 0.87: React typedefs must be imported before the generated -Swift.h.
#import <React/RCTBridgeModule.h>
#import <React/RCTComponent.h>

#if __has_include(<react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>)
#import <react_native_apphud_sdk/react_native_apphud_sdk-Swift.h>
#else
#import "react_native_apphud_sdk-Swift.h"
#endif

/**
 * Turbo Native Module `ApphudSdk`.
 *
 * Codegen emits `NativeApphudSdkSpec` as an Obj-C++ protocol, which Swift
 * cannot adopt, so this class only forwards to `ApphudSdkImpl` where the actual
 * implementation lives.
 */
@interface ApphudSdkModule : NSObject <NativeApphudSdkSpec>
@end

@implementation ApphudSdkModule {
  ApphudSdkImpl *_impl;
}

RCT_EXPORT_MODULE(ApphudSdk)

- (instancetype)init
{
  if (self = [super init]) {
    _impl = [ApphudSdkImpl new];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

/**
 * Most of `ApphudSdkImpl` is `@MainActor` and talks to Apphud's main-actor API.
 * Without this, TurboModule calls would run on the JS thread.
 */
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeApphudSdkSpecJSI>(params);
}

#pragma mark - Lifecycle

- (void)start:(NSDictionary *)options
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject
{
  [_impl start:options withResolver:resolve withRejecter:reject];
}

- (void)startManually:(NSDictionary *)options
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [_impl startManually:options withResolver:resolve withRejecter:reject];
}

- (void)logout:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl logout:resolve withRejecter:reject];
}

- (void)userId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl userId:resolve withRejecter:reject];
}

- (void)updateUserID:(NSString *)userID
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  [_impl updateUserID:userID withResolver:resolve withRejecter:reject];
}

- (void)idfv:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl idfv:resolve withRejecter:reject];
}

- (void)setHost:(NSString *)url
{
  [_impl setHost:url];
}

#pragma mark - Placements and paywalls

- (void)placements:(NSDictionary *)options
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  [_impl placements:options withResolver:resolve withRejecter:reject];
}

- (void)placement:(NSString *)identifier
          options:(NSDictionary *)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  [_impl placement:identifier options:options withResolver:resolve withRejecter:reject];
}

- (void)rawPlacements:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl rawPlacements:resolve withRejecter:reject];
}

- (void)paywallShown:(NSDictionary *)options
{
  [_impl paywallShown:options];
}

- (void)preloadPaywallScreens:(NSArray *)placementIdentifiers
{
  [_impl preloadPaywallScreens:(NSArray<NSString *> *)placementIdentifiers];
}

- (void)unloadPaywallScreen:(NSDictionary *)options
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
  [_impl unloadPaywallScreen:options withResolver:resolve withRejecter:reject];
}

#pragma mark - Products and purchases

- (void)products:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl products:resolve withRejecter:reject];
}

- (void)purchase:(NSDictionary *)props
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  [_impl purchase:props withResolver:resolve withRejecter:reject];
}

- (void)purchasePromo:(NSDictionary *)props
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [_impl purchasePromo:props withResolver:resolve withRejecter:reject];
}

- (void)checkEligibilityForPromotionalOffer:(NSDictionary *)props
                                    resolve:(RCTPromiseResolveBlock)resolve
                                     reject:(RCTPromiseRejectBlock)reject
{
  [_impl checkEligibilityForPromotionalOffer:props withResolver:resolve withRejecter:reject];
}

- (void)restorePurchases:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl restorePurchases:resolve withRejecter:reject];
}

- (void)syncPurchasesInObserverMode:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
  [_impl syncPurchasesInObserverMode:resolve withRejecter:reject];
}

- (void)isCommitmentPlanPreferred:(NSDictionary *)options
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject
{
  [_impl isCommitmentPlanPreferred:options withResolver:resolve withRejecter:reject];
}

- (void)isCommitmentPlanSupported:(NSDictionary *)options
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject
{
  [_impl isCommitmentPlanSupported:options withResolver:resolve withRejecter:reject];
}

#pragma mark - Entitlements

- (void)hasPremiumAccess:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl hasPremiumAccess:resolve withRejecter:reject];
}

- (void)hasActiveSubscription:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl hasActiveSubscription:resolve withRejecter:reject];
}

- (void)subscription:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl subscription:resolve withRejecter:reject];
}

- (void)subscriptions:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl subscriptions:resolve withRejecter:reject];
}

- (void)nonRenewingPurchases:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl nonRenewingPurchases:resolve withRejecter:reject];
}

- (void)isNonRenewingPurchaseActive:(NSString *)productIdentifier
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
  [_impl isNonRenewingPurchaseActive:productIdentifier withResolver:resolve withRejecter:reject];
}

#pragma mark - Attribution and user properties

- (void)setAttribution:(NSDictionary *)options
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  [_impl setAttribution:options withResolver:resolve withRejecter:reject];
}

- (void)attributeFromWeb:(NSDictionary *)options
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  [_impl attributeFromWeb:options withResolver:resolve withRejecter:reject];
}

- (void)setUserProperty:(NSDictionary *)args
{
  [_impl setUserProperty:args];
}

- (void)incrementUserProperty:(NSDictionary *)args
{
  [_impl incrementUserProperty:args];
}

- (void)handleDeeplinkUrl:(NSString *)url
{
  [_impl handleDeeplinkUrl:url];
}

- (void)requestDeferredDeeplinkAttribution:(RCTPromiseResolveBlock)resolve
                                    reject:(RCTPromiseRejectBlock)reject
{
  [_impl requestDeferredDeeplinkAttribution:resolve withRejecter:reject];
}

#pragma mark - Device and privacy

- (void)collectDeviceIdentifiers
{
  [_impl collectDeviceIdentifiers];
}

- (void)setDeviceIdentifiers:(NSDictionary *)options
{
  [_impl setDeviceIdentifiers:options];
}

- (void)optOutOfTracking
{
  [_impl optOutOfTracking];
}

- (void)enableDebugLogs
{
  [_impl enableDebugLogs];
}

#pragma mark - Rules and push notifications

- (void)checkRules:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl checkRules:resolve withRejecter:reject];
}

- (void)pendingRule:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl pendingRule:resolve withRejecter:reject];
}

- (void)showPendingRuleScreen:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [_impl showPendingRuleScreen:resolve withRejecter:reject];
}

- (void)submitPushNotificationsToken:(NSString *)token
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject
{
  [_impl submitPushNotificationsToken:token withResolver:resolve withRejecter:reject];
}

- (void)handlePushNotification:(NSDictionary *)payload
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
  [_impl handlePushNotification:payload withResolver:resolve withRejecter:reject];
}

@end
