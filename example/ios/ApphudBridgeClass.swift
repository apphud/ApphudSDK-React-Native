import Foundation

import ApphudSDK

/**
* This is example bridge class for Apphud SDK.
*/

class ApphudBridgeClass: NSObject {

  @objc
  static func submitPushToken(data: Data) {
    Apphud.submitPushNotificationsToken(token: data, callback: nil)
  }

  @MainActor @objc
  static func handleUserInfo(dict: [AnyHashable: Any]) {
    Apphud.handlePushNotification(apsInfo: dict)
  }

  @MainActor @objc
  static func initializeWith(_ apiKey: String) {
    Apphud.start(apiKey: apiKey)
  }
}
