#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ApphudSdk, NSObject)

RCT_EXTERN_METHOD(start:(NSDictionary)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startManually:(NSDictionary)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(logout:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasPremiumAccess:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(hasActiveSubscription:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(products:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscriptions:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(purchase:(NSDictionary)args
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(handlePushNotification:(NSDictionary)apsInfo
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(submitPushNotificationsToken:(NSString)token
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(paywalls:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscription:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isNonRenewingPurchaseActive:(NSString)productIdentifier
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

RCT_EXTERN_METHOD(optOutOfTracking:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addAttribution:(NSDictionary)options
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setUserProperty:(NSString)key
                  withValue:(NSString)value
                  withSetOnce:(BOOL)setOnce
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(incrementUserProperty:(NSString)key
                  withBy:(NSString)by
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
    return YES; // Requires setup on the main JavaScript thread
}

@end
