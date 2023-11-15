import Foundation
import React
import ApphudSDK
import StoreKit

enum ApphudSdkDelegateEvents: String, CaseIterable {
    case paywallsDidFullyLoad
    case apphudDidLoadStoreProducts
    case apphudDidChangeUserID
    case apphudSubscriptionsUpdated
    case apphudNonRenewingPurchasesUpdated
    case apphudProductIdentifiers
    case apphudDidPurchase
    case apphudWillPurchase
    case apphudDidFailPurchase
    case apphudDidSelectSurveyAnswer
}

@objc(ApphudSdkEvents)
class ApphudSdkEvents: RCTEventEmitter {
    
    var productIdentifiers:[String] = [];
    
    override init() {
        super.init();
        Apphud.setDelegate(self);
        Apphud.setUIDelegate(self);
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
            return DataTransformer.skProduct(product: product);
        }
        self.sendEvent(.apphudDidLoadStoreProducts, body: result);
    }

    func apphudDidChangeUserID(_ userID: String) {
        self.sendEvent(.apphudDidChangeUserID, body: userID);
    }
    
    func apphudSubscriptionsUpdated(_ subscriptions: [ApphudSubscription]) {
        let result:[NSDictionary] = subscriptions.map{ (subscription) -> NSDictionary in
            return DataTransformer.apphudSubscription(subscription: subscription);
        }
        self.sendEvent(.apphudSubscriptionsUpdated, body: result);
    }
    
    func apphudNonRenewingPurchasesUpdated(_ purchases: [ApphudNonRenewingPurchase]) {
        let result:[NSDictionary] = purchases.map{ (purchase) -> NSDictionary in
            return DataTransformer.nonRenewingPurchase(nonRenewingPurchase: purchase);
        }
        self.sendEvent(.apphudNonRenewingPurchasesUpdated, body: result);
    }
    
    func apphudProductIdentifiers() -> [String] {
        return self.productIdentifiers;
    }
    
    func paywallsDidFullyLoad(paywalls: [ApphudPaywall]) {
        let result = paywalls.map { $0.toMap() }
        self.sendEvent(.paywallsDidFullyLoad, body: result);
    }
}

extension ApphudSdkEvents: ApphudUIDelegate {
    
    func apphudDidPurchase(product: SKProduct, offerID: String?, screenName: String) {
        self.sendEvent(.apphudDidPurchase, body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName
        ]);
    }
    
    func apphudWillPurchase(product: SKProduct, offerID: String?, screenName: String) {
        self.sendEvent(.apphudWillPurchase, body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName
        ]);
    }
    
    func apphudDidFailPurchase(product: SKProduct, offerID: String?, errorCode: SKError.Code, screenName: String) {
        self.sendEvent(.apphudDidFailPurchase, body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName,
            "errorCode": errorCode.rawValue
        ]);
    }
    
    func apphudDidSelectSurveyAnswer(question: String, answer: String, screenName: String) {
        self.sendEvent(.apphudDidSelectSurveyAnswer, body: [
            "question": question,
            "answer": answer,
            "screenName": screenName
        ])
    }
}
