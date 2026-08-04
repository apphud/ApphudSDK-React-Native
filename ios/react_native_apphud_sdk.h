/**
 * Module header for the `react_native_apphud_sdk` clang module.
 *
 * The pod is compiled with `-import-underlying-module`, so Swift emits an
 * unconditional `#import <react_native_apphud_sdk/react_native_apphud_sdk.h>`
 * at the top of the generated `react_native_apphud_sdk-Swift.h`. CocoaPods
 * names its own umbrella `react-native-apphud-sdk-umbrella.h`, so this file has
 * to exist under the module name for the Obj-C++ wrappers to be able to include
 * the generated Swift header.
 *
 * It must declare every Obj-C type used in the `@objc` API of the Swift
 * classes, since the generated header is parsed right after this one.
 */

#import <React/RCTBridgeModule.h>
#import <React/RCTComponent.h>

#import "ApphudRNBridge.h"
