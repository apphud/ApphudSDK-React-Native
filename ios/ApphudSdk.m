#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ApphudSdk, NSObject)

RCT_EXTERN_METHOD(start:(NSDictionary*)options)

RCT_EXTERN_METHOD(startManually:(NSDictionary*)options)

RCT_EXTERN_METHOD(hasPremiumAccess:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasActiveSubscription:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(products:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscriptions:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(purchase:(NSDictionary*)args
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(paywalls:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscription:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isNonRenewingPurchaseActive:(NSString*)productIdentifier
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(nonRenewingPurchases:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(restorePurchases:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(syncPurchasesInObserverMode:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(userId:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkEligibilitiesForIntroductoryOffer:(NSString)productIdentifier
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(collectDeviceIdentifiers)
RCT_EXTERN_METHOD(setAdvertisingIdentifier:(NSString*)idfa)
RCT_EXTERN_METHOD(optOutOfTracking)
RCT_EXTERN_METHOD(enableDebugLogs)
RCT_EXTERN_METHOD(logout:(RCTPromiseResolveBlock)resolve)
RCT_EXTERN_METHOD(addAttribution:(NSDictionary*)options)
RCT_EXTERN_METHOD(setUserProperty:(NSDictionary*)options)
RCT_EXTERN_METHOD(incrementUserProperty:(NSDictionary*)options)
RCT_EXTERN_METHOD(submitPushNotificationsToken:(NSString*)token)
RCT_EXTERN_METHOD(handlePushNotification:(NSDictionary*)apsInfo)

+ (BOOL)requiresMainQueueSetup {
    return YES; // Requires setup on the main JavaScript thread
}

@end
