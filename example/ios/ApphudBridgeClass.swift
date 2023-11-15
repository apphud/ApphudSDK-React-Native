//
//  ApphudBridgeClass.swift
//  ApphudSdkExample
//
//  Created by Renat Kurbanov on 15.11.2023.
//

import Foundation

import ApphudSDK

class ApphudBridgeClass: NSObject {

  @objc
  static func submitPushToken(data: Data) {
    Apphud.submitPushNotificationsToken(token: data, callback: nil)
  }

  @objc
  static func handleUserInfo(dict: NSDictionary) {
    if let dict = dict as? [AnyHashable: Any] {
      Apphud.handlePushNotification(apsInfo: dict)
    }
  }

  @objc
  static func initializeWith(_ apiKey: String) {
    Apphud.start(apiKey: apiKey)
  }
}
