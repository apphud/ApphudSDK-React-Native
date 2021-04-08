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
            "apphudProductIdentifiers"
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
}
