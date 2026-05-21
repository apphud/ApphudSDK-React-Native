import ApphudSDK

final class ApphudPaywallsHelper {
  @MainActor
  private static func resolvePaywall(
    from placements: [ApphudPlacement],
    paywallIdentifier: String?,
    placementIdentifier: String?
  ) -> ApphudPaywall? {
    if let placementIdentifier {
      return placements.first(where: { $0.identifier == placementIdentifier })?.paywall
    }
    if let paywallIdentifier {
      return placements.first(where: { $0.paywall?.identifier == paywallIdentifier })?.paywall
    }
    return nil
  }

  @MainActor
  private static func loadPlacements(
    maxAttempts: Int = APPHUD_DEFAULT_RETRIES,
    forceRefresh: Bool = false
  ) async -> [ApphudPlacement] {
    if forceRefresh {
      return await withCheckedContinuation { continuation in
        Apphud.fetchPlacements(maxAttempts: maxAttempts, forceRefresh: true) { placements, _ in
          continuation.resume(returning: placements)
        }
      }
    }
    return await Apphud.placements(maxAttempts: maxAttempts)
  }

  @MainActor
  static func getPaywall(
    paywallIdentifier: String?,
    placementIdentifier: String?,
    maxAttempts: Int = APPHUD_DEFAULT_RETRIES,
    forceRefresh: Bool = false
  ) async -> ApphudPaywall? {
    guard paywallIdentifier != nil || placementIdentifier != nil else {
      return nil
    }
    let placements = await loadPlacements(maxAttempts: maxAttempts, forceRefresh: forceRefresh)
    return resolvePaywall(
      from: placements,
      paywallIdentifier: paywallIdentifier,
      placementIdentifier: placementIdentifier
    )
  }

  @MainActor
  static func getPaywall(options: [AnyHashable: Any]) async -> ApphudPaywall? {
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = options["forceRefresh"] as? Bool ?? false
    let placementIdentifier = options["placementIdentifier"] as? String
    let paywallIdentifier = options["paywallIdentifier"] as? String

    return await getPaywall(
      paywallIdentifier: paywallIdentifier,
      placementIdentifier: placementIdentifier,
      maxAttempts: maxAttempts,
      forceRefresh: forceRefresh
    )
  }

  @MainActor
  static func getPaywalls(
    maxAttempts: Int = APPHUD_DEFAULT_RETRIES,
    forceRefresh: Bool = false
  ) async -> [ApphudPaywall] {
    let placements = await loadPlacements(maxAttempts: maxAttempts, forceRefresh: forceRefresh)
    return placements.compactMap(\.paywall)
  }

  @MainActor
  static func findProduct(
    productId: String,
    placementIdentifier: String?,
    paywallIdentifier: String?,
    maxAttempts: Int = APPHUD_DEFAULT_RETRIES,
    forceRefresh: Bool = false
  ) async -> ApphudProduct? {
    guard let paywall = await getPaywall(
      paywallIdentifier: paywallIdentifier,
      placementIdentifier: placementIdentifier,
      maxAttempts: maxAttempts,
      forceRefresh: forceRefresh
    ) else {
      return nil
    }
    return paywall.products.first { $0.productId == productId }
  }
}
