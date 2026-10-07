import ApphudSDK
import StoreKit

final class ApphudPaywallsHelper {
  private static let skProductsTimeout: TimeInterval = 5
  // Set after a wait on placements loaded without an error timed out: the StoreKit 1 fetch
  // delivered nothing or took longer, and the next calls don't wait.
  @MainActor private static var skProductsWaitGaveUp = false

  /// What `Apphud.placements()` returns, once the `SKProduct`s are loaded.
  @MainActor
  static func placementsWithSKProducts() async -> [ApphudPlacement] {
    let (placements, error) = await withCheckedContinuation { continuation in
      Apphud.fetchPlacements { placements, error in
        continuation.resume(returning: (placements, error))
      }
    }
    if error == nil {
      await waitForSKProducts(for: placements)
    }
    return placements
  }

  /// The native SDK reports placements as ready once StoreKit 2 products load, and fetches the
  /// `SKProduct`s this bridge sends to JS in parallel; that fetch may finish later. Call once
  /// placements are loaded: waits only while one of `products` has no `SKProduct` and no
  /// `SKProduct`s have been loaded yet. A call that can't tell whether the load failed passes
  /// `canGiveUp: false`, so its timeout doesn't stop the next waits.
  @MainActor
  static func waitForSKProducts(for products: [ApphudProduct], canGiveUp: Bool = true) async {
    guard !skProductsWaitGaveUp, products.contains(where: { skProduct(for: $0) == nil }) else { return }
    let deadline = Date().addingTimeInterval(skProductsTimeout)
    while Apphud.products == nil {
      guard Date() < deadline else {
        if canGiveUp { skProductsWaitGaveUp = true }
        return
      }
      try? await Task.sleep(nanoseconds: 100_000_000)
    }
  }

  @MainActor
  static func waitForSKProducts(for placements: [ApphudPlacement], canGiveUp: Bool = true) async {
    await waitForSKProducts(for: placements.flatMap { $0.paywall?.products ?? [] }, canGiveUp: canGiveUp)
  }

  /// The product's `skProduct`, or the same product from the loaded `SKProduct`s while the SDK
  /// hasn't attached it to the paywall yet.
  static func skProduct(for product: ApphudProduct) -> SKProduct? {
    product.skProduct ?? Apphud.product(productIdentifier: product.productId)
  }

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
