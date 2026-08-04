import Foundation
import React
import ApphudSDK
import StoreKit
#if canImport(UIKit)
import UIKit
#endif

/// Implementation behind the `ApphudSdkEvents` Turbo Native Module.
///
/// Forwards Apphud delegate callbacks to `emitter`, which is the Obj-C++ module
/// wrapper (`ApphudSdkEventsModule`). The wrapper owns the Codegen-generated
/// `emitOn…` methods, which cannot be reached from Swift.
///
/// The delegate conformances deliberately live on a file-private proxy: this
/// class ends up in the generated `-Swift.h`, and adopting the Apphud protocols
/// here would drag their whole Obj-C surface — and any Swift-only type in their
/// signatures — into every Obj-C++ translation unit that includes that header.
@objc(ApphudSdkEventsImpl)
public final class ApphudSdkEventsImpl: NSObject {

  @objc public weak var emitter: (any ApphudSdkEventsEmitting)?

  fileprivate var productIdentifiers: [String] = []

  private lazy var delegateProxy = ApphudEventsDelegateProxy(owner: self)

  /// Keeps the events module that installed the deep link handler, so it can be
  /// re-applied after `Apphud.start` / `startManually`, which reset the native
  /// handler to `nil` when no `deeplinkHandler` argument is passed.
  private static weak var shared: ApphudSdkEventsImpl?

  public override init() {
    super.init()
    Apphud.setDelegate(delegateProxy)
    Apphud.setUIDelegate(delegateProxy)
    Self.shared = self
    Task { @MainActor in
      self.installDeeplinkHandler()
    }
  }

  /// Re-installs the deep link handler. Call after `Apphud.start` /
  /// `startManually`, since those APIs clear the handler.
  static func reapplyDeeplinkHandlerIfNeeded() {
    guard let events = Self.shared else { return }

    Task { @MainActor in
      events.installDeeplinkHandler()
    }
  }

  @MainActor
  private func installDeeplinkHandler() {
    Apphud.setDeeplinkHandler { [weak self] attribution, kind, url in
      self?.notifyDeeplinkAttribution(attribution: attribution, kind: kind, url: url)
    }
  }

  private func notifyDeeplinkAttribution(
    attribution: [String: Any],
    kind: ApphudDeeplinkAttributionKind,
    url: URL?
  ) {
    let body: [String: Any] = [
      "attribution": attribution,
      "kind": kind == .deferred ? "deferred" : "direct",
      "url": url?.absoluteString as Any,
    ]

    // Deferred attribution may be delivered from a background thread.
    if Thread.isMainThread {
      self.emitter?.emitApphudDeeplinkAttribution(body)
    } else {
      DispatchQueue.main.async {
        self.emitter?.emitApphudDeeplinkAttribution(body)
      }
    }
  }

  @objc(setApphudProductIdentifiers:withResolve:withReject:)
  public func setApphudProductIdentifiers(
    ids: NSArray,
    resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) -> Void {
    self.productIdentifiers = ids as? [String] ?? []
    resolve(self.productIdentifiers)
  }
}

/// Receives every Apphud delegate callback on behalf of `ApphudSdkEventsImpl`.
private final class ApphudEventsDelegateProxy: NSObject {
  private weak var owner: ApphudSdkEventsImpl?

  init(owner: ApphudSdkEventsImpl) {
    self.owner = owner
  }

  var emitter: (any ApphudSdkEventsEmitting)? {
    owner?.emitter
  }
}

extension ApphudEventsDelegateProxy: ApphudDelegate {

  func apphudDidFetchStoreKitProducts(_ products: [SKProduct]) {
    let result: [NSDictionary] = products.map { (product) -> NSDictionary in
      return product.toMap();
    }
    self.emitter?.emitApphudDidLoadStoreProducts(result)
  }

  func apphudDidChangeUserID(_ userID: String) {
    self.emitter?.emitApphudDidChangeUserID(userID)
  }

  func apphudSubscriptionsUpdated(_ subscriptions: [ApphudSubscription]) {
    let result: [NSDictionary] = subscriptions.map { (
      subscription
    ) -> NSDictionary in
      return subscription.toMap();
    }
    self.emitter?.emitApphudSubscriptionsUpdated(result)
  }

  func apphudNonRenewingPurchasesUpdated(
    _ purchases: [ApphudNonRenewingPurchase]
  ) {
    let result = purchases.map { $0.toMap() }
    self.emitter?.emitApphudNonRenewingPurchasesUpdated(result)
  }

  func apphudProductIdentifiers() -> [String] {
    return owner?.productIdentifiers ?? []
  }

  func placementsDidFullyLoad(placements: [ApphudPlacement]) {
    let result = placements.map { $0.toMap() }
    self.emitter?.emitPlacementsDidFullyLoad(result)
  }

  func userDidLoad(user: ApphudUser) {
    Task { @MainActor in
      self.emitter?.emitUserDidLoad(user.toMap() as! [AnyHashable: Any])
    }
  }
}

extension ApphudEventsDelegateProxy: ApphudUIDelegate {

  private func sanitize(_ map: [String: Any?]) -> [String: Any] {
    var result: [String: Any] = [:]
    for (key, value) in map {
      if let value {
        result[key] = value
      } else {
        result[key] = NSNull()
      }
    }
    return result
  }

  /// `ApphudUIDelegate` is `@MainActor`, so every caller of this helper is too.
  @MainActor
  private func currentRuleMap(screenName: String?) -> [String: Any] {
    if let rule = Apphud.pendingRule() {
      return sanitize(rule.toMap())
    }
    return sanitize([
      "ruleName": "",
      "screenName": screenName ?? "",
      "screenId": nil as String?,
      "paywallId": nil as String?,
      "paywallIdentifier": nil as String?,
    ])
  }

  private func productMap(from product: SKProduct) -> [String: Any] {
    return [
      "productId": product.productIdentifier,
      "store": "app_store",
      "name": product.localizedTitle,
      "skProduct": product.toMap(),
    ]
  }

  private func transactionMap(from transaction: SKPaymentTransaction?) -> [String: Any]? {
    guard let transaction else { return nil }
    var map: [String: Any] = [
      "state": transaction.transactionState.rawValue,
      "productId": transaction.payment.productIdentifier,
    ]
    if let id = transaction.transactionIdentifier {
      map["id"] = id
    }
    if let date = transaction.transactionDate {
      map["date"] = date.timeIntervalSince1970
    }
    return map
  }

  private static func message(for errorCode: SKError.Code) -> String {
    switch errorCode {
    case .paymentCancelled:
      return "Payment cancelled by user"
    case .paymentInvalid:
      return "Payment is invalid"
    case .paymentNotAllowed:
      return "This device is not allowed to make payments"
    case .storeProductNotAvailable:
      return "Product is not available in the current storefront"
    case .cloudServicePermissionDenied:
      return "User has not allowed access to cloud service information"
    case .cloudServiceNetworkConnectionFailed:
      return "Could not connect to the network"
    case .cloudServiceRevoked:
      return "User has revoked permission to use this cloud service"
    case .privacyAcknowledgementRequired:
      return "User has not yet acknowledged the privacy policy"
    case .unauthorizedRequestData:
      return "App is attempting to use a property without required entitlement"
    case .invalidOfferIdentifier:
      return "Offer identifier is invalid"
    case .invalidOfferPrice:
      return "Offer price is no longer valid"
    case .invalidSignature:
      return "Signature in a payment discount is not valid"
    case .missingOfferParams:
      return "Parameters are missing in a payment discount"
    default:
      return NSError(domain: SKErrorDomain, code: errorCode.rawValue).localizedDescription
    }
  }

  // MARK: - Gates (always allow)

  func apphudShouldPerformRule(rule: ApphudRule) -> Bool {
    return true
  }

  func apphudShouldShowScreen(screenName: String) -> Bool {
    return true
  }

#if os(iOS)
  func apphudScreenDismissAction(
    screenName: String,
    controller: UIViewController
  ) -> ApphudScreenDismissAction {
    return .thankAndClose
  }

  func apphudRuleWithoutPaywallScreen(rule: ApphudRule, paywall: ApphudPaywall) {
    self.emitter?.emitApphudRulePaywallWithoutScreen([
      "rule": sanitize(rule.toMap()),
      "paywall": paywall.toMap(),
    ])
  }
#endif

  // MARK: - Lifecycle events

  func apphudScreenDidAppear(screenName: String) {
    // Legacy iOS-only event (backward compatibility).
    self.emitter?.emitApphudScreenDidAppear(["screenName": screenName])
    self.emitter?.emitApphudRuleScreenDidAppear([
      "rule": currentRuleMap(screenName: screenName),
    ])
  }

  func apphudWillPurchase(
    product: SKProduct,
    offerID: String?,
    screenName: String
  ) {
    // Legacy iOS-only event (backward compatibility).
    self.emitter?.emitApphudWillPurchase([
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName,
    ])
    self.emitter?.emitApphudRuleWillPurchase([
      "rule": currentRuleMap(screenName: screenName),
      "product": productMap(from: product),
    ])
  }

  // Legacy success event — keep on the no-transaction overload.
  func apphudDidPurchase(
    product: SKProduct,
    offerID: String?,
    screenName: String
  ) {
    self.emitter?.emitApphudDidPurchase([
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName,
    ])
  }

  // New rule-scoped purchase completed — only the transaction overload, so the
  // SDK's dual call does not double-fire `apphudRulePurchaseCompleted`.
  func apphudDidPurchase(
    product: SKProduct,
    offerID: String?,
    transaction: SKPaymentTransaction?,
    screenName: String
  ) {
    let productId = product.productIdentifier
    let subscription = Apphud.subscriptions()?.first { $0.productId == productId }
    let nonRenewingPurchase = subscription == nil
      ? Apphud.nonRenewingPurchases()?.first { $0.productId == productId }
      : nil

    var result: [String: Any] = [
      "userCanceled": false,
    ]
    if let subscription {
      result["subscription"] = subscription.toMap()
    }
    if let nonRenewingPurchase {
      result["nonRenewingPurchase"] = nonRenewingPurchase.toMap()
    }
    if let transactionMap = transactionMap(from: transaction) {
      result["transaction"] = transactionMap
    }

    self.emitter?.emitApphudRulePurchaseCompleted([
      "rule": currentRuleMap(screenName: screenName),
      "result": result,
    ])
  }

  func apphudDidFailPurchase(
    product: SKProduct,
    offerID: String?,
    errorCode: SKError.Code,
    screenName: String
  ) {
    // Legacy iOS-only event (backward compatibility).
    self.emitter?.emitApphudDidFailPurchase([
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName,
      "errorCode": errorCode.rawValue,
    ])

    self.emitter?.emitApphudRulePurchaseCompleted([
      "rule": currentRuleMap(screenName: screenName),
      "result": [
        "error": [
          "code": errorCode.rawValue,
          "message": Self.message(for: errorCode),
        ] as [String: Any],
        "userCanceled": errorCode == .paymentCancelled,
      ] as [String: Any],
    ])
  }

  func apphudScreenWillDismiss(screenName: String, error: Error?) {
    self.emitter?.emitApphudRuleScreenWillDismiss([
      "rule": currentRuleMap(screenName: screenName),
      "error": error?.localizedDescription ?? NSNull(),
    ])
  }

#if os(iOS)
  // Only the screenName overload — implementing both would double-fire.
  func apphudDidDismissScreen(controller: UIViewController, screenName: String?) {
    self.emitter?.emitApphudRuleScreenDidDismiss([
      "rule": currentRuleMap(screenName: screenName),
    ])
  }
#endif

  func apphudDidSelectSurveyAnswer(
    question: String,
    answer: String,
    screenName: String
  ) {
    // Legacy iOS-only event (backward compatibility).
    self.emitter?.emitApphudDidSelectSurveyAnswer([
      "question": question,
      "answer": answer,
      "screenName": screenName,
    ])
    self.emitter?.emitApphudRuleDidSelectSurveyAnswer([
      "rule": currentRuleMap(screenName: screenName),
      "question": question,
      "answer": answer,
    ])
  }
}
