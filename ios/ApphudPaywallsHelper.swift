import ApphudSDK
import Combine

final class ApphudPaywallsHelper {
  // TODO: удалить
  static func getPaywall(paywallIdentifier:String?, placementIdentifier: String?) async -> ApphudPaywall? {
    return nil
  }
  
  static func getPaywalls() async -> [ApphudPaywall] {
    return await withCheckedContinuation { @MainActor continuation in
      continuation.resume(returning: [])
    }
  }
}
