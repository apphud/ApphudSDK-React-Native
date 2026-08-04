#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ExamplePush, NSObject)

RCT_EXTERN_METHOD(submitCurrentToken:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end
