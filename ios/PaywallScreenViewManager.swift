import Foundation
import UIKit

@objc(PaywallScreenViewManager)
class PaywallScreenViewManager : RCTViewManager {
  override func view() -> UIView! {
    return PaywallScreenView()
  }
  
  override class func requiresMainQueueSetup() -> Bool {
    return false
  }
}
