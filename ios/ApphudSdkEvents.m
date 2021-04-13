#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ApphudSdkEvents, RCTEventEmitter)

RCT_EXTERN_METHOD(
    setApphudProductIdentifiers:(NSArray)ids
    withResolve:(RCTPromiseResolveBlock)resolve
    withReject:(RCTPromiseRejectBlock)reject
)

@end
