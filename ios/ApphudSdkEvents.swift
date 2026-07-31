import Foundation
import React
import ApphudSDK
import StoreKit

enum ApphudSdkDelegateEvents: String, CaseIterable {
  case placementsDidFullyLoad
  case userDidLoad
  case apphudDidLoadStoreProducts
  case apphudDidChangeUserID
  case apphudSubscriptionsUpdated
  case apphudNonRenewingPurchasesUpdated
  case apphudProductIdentifiers
  case apphudScreenDidAppear
  case apphudDidPurchase
  case apphudWillPurchase
  case apphudDidFailPurchase
  case apphudDidSelectSurveyAnswer
  case apphudDeeplinkAttribution
}

@objc(ApphudSdkEvents)
class ApphudSdkEvents: RCTEventEmitter {
    
  var productIdentifiers:[String] = [];

  /// Keeps the events module that installed the deep link handler, so it can be
  /// re-applied after `Apphud.start` / `startManually`, which reset the native
  /// handler to `nil` when no `deeplinkHandler` argument is passed.
  private static weak var shared: ApphudSdkEvents?

  override init() {
    super.init();
    Apphud.setDelegate(self);
    Apphud.setUIDelegate(self);
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
      self.sendEvent(.apphudDeeplinkAttribution, body: body)
    } else {
      DispatchQueue.main.async {
        self.sendEvent(.apphudDeeplinkAttribution, body: body)
      }
    }
  }
    
  @objc(setApphudProductIdentifiers:withResolve:withReject:)
  public func setApphudProductIdentifiers(ids: NSArray, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    self.productIdentifiers = ids as? [String] ?? []
    resolve(self.productIdentifiers);
  }

  override func supportedEvents() -> [String]! {
    ApphudSdkDelegateEvents.allCases.map { $0.rawValue }
  }
}

extension ApphudSdkEvents: ApphudDelegate {
    
  func sendEvent(_ event: ApphudSdkDelegateEvents, body: Any!) {
    self.sendEvent(withName: event.rawValue, body: body)
  }

  func apphudDidFetchStoreKitProducts(_ products: [SKProduct]) {
    let result:[NSDictionary] = products.map{ (product) -> NSDictionary in
      return product.toMap();
    }
    self.sendEvent(.apphudDidLoadStoreProducts, body: result);
  }

  func apphudDidChangeUserID(_ userID: String) {
    self.sendEvent(.apphudDidChangeUserID, body: userID);
  }
    
  func apphudSubscriptionsUpdated(_ subscriptions: [ApphudSubscription]) {
    let result:[NSDictionary] = subscriptions.map{ (
      subscription
    ) -> NSDictionary in
      return subscription.toMap();
    }
    self.sendEvent(.apphudSubscriptionsUpdated, body: result);
  }
    
  func apphudNonRenewingPurchasesUpdated(
    _ purchases: [ApphudNonRenewingPurchase]
  ) {
    let result = purchases.map{ $0.toMap() }
    self.sendEvent(.apphudNonRenewingPurchasesUpdated, body: result);
  }
    
  func apphudProductIdentifiers() -> [String] {
    return self.productIdentifiers;
  }
    
  func placementsDidFullyLoad(placements: [ApphudPlacement]) {
    let result = placements.map { $0.toMap() }
    self.sendEvent(.placementsDidFullyLoad, body: result);
  }

  func userDidLoad(user: ApphudUser) {
    Task { @MainActor in
      self.sendEvent(.userDidLoad, body: user.toMap());
    }
  }
}

extension ApphudSdkEvents: ApphudUIDelegate {
    
  func apphudDidPurchase(
    product: SKProduct,
    offerID: String?,
    screenName: String
  ) {
    self.sendEvent(.apphudDidPurchase, body: [
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName
    ]);
  }
    
  func apphudWillPurchase(
    product: SKProduct,
    offerID: String?,
    screenName: String
  ) {
    self.sendEvent(.apphudWillPurchase, body: [
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName
    ]);
  }


  func apphudScreenDidAppear(screenName: String) {
    self.sendEvent(.apphudScreenDidAppear, body: ["screenName": screenName])
  }

  func apphudDidFailPurchase(
    product: SKProduct,
    offerID: String?,
    errorCode: SKError.Code,
    screenName: String
  ) {
    self.sendEvent(.apphudDidFailPurchase, body: [
      "product": product.toMap(),
      "offerId": offerID as Any,
      "screenName": screenName,
      "errorCode": errorCode.rawValue
    ]);
  }
    
  func apphudDidSelectSurveyAnswer(
    question: String,
    answer: String,
    screenName: String
  ) {
    self.sendEvent(.apphudDidSelectSurveyAnswer, body: [
      "question": question,
      "answer": answer,
      "screenName": screenName
    ])
  }
}
