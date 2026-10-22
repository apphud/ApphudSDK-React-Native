import Foundation

typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void

struct RestoreResult { let error: Error? }

@MainActor enum Apphud {
  static var installation = ""
  static var user = ""
  static var device = ""
  static var hasUser = false
  static var restoreCalls = 0
  static var callback: ((RestoreResult) -> Void)?

  static func installationID() -> String { installation }
  static func userID() -> String { user }
  static func deviceID() -> String { device }
  static func currentUser() -> NSObject? { hasUser ? NSObject() : nil }
  static func restorePurchases(callback: @escaping (RestoreResult) -> Void) {
    restoreCalls += 1
    self.callback = callback
  }
  static func reset(installation: String = "", user: String = "", device: String = "", hasUser: Bool = false) {
    self.installation = installation
    self.user = user
    self.device = device
    self.hasUser = hasUser
    restoreCalls = 0
    callback = nil
  }
}

@MainActor final class ApphudSdk: NSObject {
// METHOD_UNDER_TEST
}

@main struct ObserverSyncTests {
  @MainActor static func rejected(_ label: String, code: String) {
    var resolutions = 0
    var errors: [String] = []
    ApphudSdk().syncPurchasesInObserverMode(resolve: { _ in resolutions += 1 }, reject: { code, _, _ in errors.append(code ?? "") })
    precondition(Apphud.restoreCalls == 0, "\(label): must not call Restore")
    precondition(resolutions == 0 && errors == [code], "\(label): must reject exactly once")
    print("PASS: \(label)")
  }

  @MainActor static func main() {
    Apphud.reset(installation: "install", user: "B", device: "install", hasUser: true)
    rejected("V2 cannot transfer A's purchase to B", code: "observer_sync_unsupported_platform")

    Apphud.reset(installation: "install")
    rejected("V2 before customer registration", code: "observer_sync_unsupported_platform")

    Apphud.reset()
    rejected("Before start or delayed initialization", code: "observer_sync_not_ready")

    Apphud.reset(hasUser: true)
    rejected("Synthetic fallback user before start", code: "observer_sync_not_ready")

    Apphud.reset(user: "user", hasUser: true)
    rejected("User without resolved device ID", code: "observer_sync_not_ready")

    Apphud.reset(device: "device", hasUser: true)
    rejected("Device without resolved user ID", code: "observer_sync_not_ready")

    Apphud.reset(user: "user", device: "device")
    rejected("Resolved IDs without ready customer", code: "observer_sync_not_ready")

    for success in [true, false] {
      Apphud.reset(user: "legacy", device: "legacy-device", hasUser: true)
      var values: [Bool] = []
      var errors = 0
      ApphudSdk().syncPurchasesInObserverMode(resolve: { values.append($0 as! Bool) }, reject: { _, _, _ in errors += 1 })
      precondition(Apphud.restoreCalls == 1 && values.isEmpty && errors == 0, "V1 must wait for native Restore")
      Apphud.callback?(RestoreResult(error: success ? nil : NSError(domain: "test", code: 1)))
      precondition(values == [success] && errors == 0, "V1 must preserve native success/error result")
      print("PASS: V1 Restore callback success=\(success)")
    }
    print("9 iOS observer sync tests passed")
  }
}
