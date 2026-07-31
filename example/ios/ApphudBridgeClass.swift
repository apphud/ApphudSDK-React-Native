import Foundation
import React
import ApphudSDK
import UIKit

/**
 * Example push helpers for Rules.
 *
 * - AppDelegate stores the APNs token and submits it when received.
 * - JS calls `ExamplePush.submitCurrentToken()` after `Apphud.start` so the
 *   token is re-submitted once the user is registered (parity with Flutter).
 */
@objc(ExamplePush)
class ApphudBridgeClass: NSObject {

  /// Last APNs token received; used to (re)submit after Apphud.start.
  private static var apnsToken: Data?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc
  static func submitPushToken(data: Data) {
    let hex = data.map { String(format: "%02.2hhx", $0) }.joined()
    print("[ApphudExample] APNs device token: \(hex)")
    apnsToken = data
    submitTokenToApphud(data) { success in
      print("[ApphudExample] Apphud.submitPushNotificationsToken success=\(success)")
    }
  }

  @MainActor @objc
  static func handleUserInfo(dict: [AnyHashable: Any]) {
    let handled = Apphud.handlePushNotification(apsInfo: dict)
    print("[ApphudExample] handlePushNotification handled=\(handled)")
  }

  @MainActor @objc
  static func initializeWith(_ apiKey: String) {
    Apphud.start(apiKey: apiKey)
  }

  /// Re-submit APNs token after Apphud.start, or trigger registration if none yet.
  @objc(submitCurrentToken:withRejecter:)
  func submitCurrentToken(
    _ resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if let token = Self.apnsToken {
      Self.submitTokenToApphud(token) { success in
        resolve(success)
      }
      return
    }

    print("[ApphudExample] submitCurrentToken: no token yet, calling registerForRemoteNotifications")
    DispatchQueue.main.async {
      UIApplication.shared.registerForRemoteNotifications()
    }
    resolve(false)
  }

  private static func submitTokenToApphud(
    _ token: Data,
    completion: ((Bool) -> Void)? = nil
  ) {
    Apphud.submitPushNotificationsToken(token: token) { success in
      completion?(success)
    }
  }
}
