import Foundation
import React
import ApphudSDK
import StoreKit

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
        self.productIdentifiers = ids as! [String];
        resolve(self.productIdentifiers);
    }

    override func supportedEvents() -> [String]! {
        return [
            "apphudDidFetchStoreKitProducts",
            "apphudDidChangeUserID",
            "apphudSubscriptionsUpdated",
            "apphudNonRenewingPurchasesUpdated",
            "apphudProductIdentifiers",
            "apphudDidPurchase",
            "apphudWillPurchase",
            "apphudDidFailPurchase",
            "apphudDidSelectSurveyAnswer"
        ]
    }
}

extension ApphudSdkEvents: ApphudDelegate {
    
    func apphudDidFetchStoreKitProducts(_ products: [SKProduct]) {
        let result:[NSDictionary] = products.map{ (product) -> NSDictionary in
            return DataTransformer.skProduct(product: product);
        }
        self.sendEvent(withName: "apphudDidFetchStoreKitProducts", body: result);
    }

    func apphudDidChangeUserID(_ userID: String) {
        self.sendEvent(withName: "apphudDidChangeUserID", body: userID);
    }
    
    func apphudSubscriptionsUpdated(_ subscriptions: [ApphudSubscription]) {
        let result:[NSDictionary] = subscriptions.map{ (subscription) -> NSDictionary in
            return DataTransformer.apphudSubscription(subscription: subscription);
        }
        self.sendEvent(withName: "apphudSubscriptionsUpdated", body: result);
    }
    
    func apphudNonRenewingPurchasesUpdated(_ purchases: [ApphudNonRenewingPurchase]) {
        let result:[NSDictionary] = purchases.map{ (purchase) -> NSDictionary in
            return DataTransformer.nonRenewingPurchase(nonRenewingPurchase: purchase);
        }
        self.sendEvent(withName: "apphudNonRenewingPurchasesUpdated", body: result);
    }
    
    func apphudProductIdentifiers() -> [String] {
        return self.productIdentifiers;
    }
    
    func paywallsDidFullyLoad(paywalls: [ApphudPaywall]) {
        let result:[NSDictionary] = paywalls.map{ (paywall) ->  NSDictionary in
            return paywall.toMap();
        }
        self.sendEvent(withName: "paywallsDidFullyLoad", body: result);
    }
}

extension ApphudSdkEvents: ApphudUIDelegate {
    
    func apphudDidPurchase(product: SKProduct, offerID: String?, screenName: String) {
        self.sendEvent(withName: "apphudDidPurchase", body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName
        ]);
    }
    
    func apphudWillPurchase(product: SKProduct, offerID: String?, screenName: String) {
        self.sendEvent(withName: "apphudWillPurchase", body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName
        ]);
    }
    
    func apphudDidFailPurchase(product: SKProduct, offerID: String?, errorCode: SKError.Code, screenName: String) {
        self.sendEvent(withName: "apphudWillPurchase", body: [
            "product": DataTransformer.skProduct(product: product),
            "offerId": offerID as Any,
            "screenName": screenName,
            "errorCode": errorCode.rawValue
        ]);
    }
    
    func apphudDidSelectSurveyAnswer(question: String, answer: String, screenName: String) {
        self.sendEvent(withName: "apphudDidSelectSurveyAnswer", body: [
            "question": question,
            "answer": answer,
            "screenName": screenName
        ])
    }
}
