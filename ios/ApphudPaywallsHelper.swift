import ApphudSDK
import Combine

final class ApphudPaywallsHelper {
  static func getPaywall(paywallIdentifier:String?, placementIdentifier: String?) async -> ApphudPaywall? {
    if paywallIdentifier == nil, placementIdentifier == nil {
      return nil
    }
      
    var paywall:ApphudPaywall?
        
    if(placementIdentifier != nil) {
      let placements = await Apphud.placements()
      paywall = placements
        .first(where: {pl in pl.identifier == placementIdentifier})?.paywall
    } else {
      paywall = await withCheckedContinuation { @MainActor continuation in
        Apphud.paywallsDidLoadCallback{ paywalls, error in
          paywall = paywalls
            .first(where: { pw in return pw.identifier == paywallIdentifier })
          continuation.resume(returning: paywall)
        }
      }
    }
    return paywall
  }
    
  static func getPaywalls() async -> [ApphudPaywall] {
    return await withCheckedContinuation { @MainActor continuation in
      Apphud
        .paywallsDidLoadCallback{
          pwls,
          error in continuation.resume(returning: pwls)
        }
    }
  }
}
