import ApphudSDK
import StoreKit

@objc(ApphudSdk)
class ApphudSdk: NSObject {

    @objc(start:withResolver:withRejecter:)
    func start(options: NSDictionary, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let apiKey = options["apiKey"] as! String;
        let userID = options["userId"] as? String;
        let observerMode = options["observerMode"] as? Bool ?? true;
        Apphud.start(apiKey: apiKey, userID: userID, observerMode: observerMode);
        resolve(true);
    }
    
    @objc(startManually:withResolver:withRejecter:)
    func startManually(options: NSDictionary, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let apiKey = options["apiKey"] as! String;
        let userID = options["userId"] as? String;
        let deviceID = options["deviceId"] as? String;
        let observerMode = options["observerMode"] as? Bool ?? true;
        Apphud.startManually(apiKey: apiKey, userID: userID, deviceID: deviceID, observerMode: observerMode);
        resolve(true);
    }
    
    @objc(logout:withRejecter:)
    func logout(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        Apphud.logout();
        resolve(true);
    }
    
    @objc(hasActiveSubscription:withRejecter:)
    func hasActiveSubscription(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(Apphud.hasActiveSubscription());
    }
    
    @objc(products:withRejecter:)
    func products(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let products:[SKProduct]? = Apphud.products();
        resolve(
            products?.map{ (product) -> NSDictionary in
                return [
                    "id": product.productIdentifier,
                    "price": product.price,
                    "regionCode": product.priceLocale.regionCode as Any,
                    "currencyCode": product.priceLocale.currencyCode as Any,
                ];
            }
        );
    }
    
    @objc(product:withResolver:withRejecter:)
    func product(productIdentifier:String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(
            Apphud.product(productIdentifier: productIdentifier)
        );
    }
    
    @objc(purchase:withResolver:withRejecter:)
    func purchase(productIdentifier:String,  resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Apphud.purchaseById(productIdentifier) { (result:ApphudPurchaseResult) in
            let transaction:SKPaymentTransaction? = result.transaction;
            var response = [
                "subscription": [
                    "productId": result.subscription?.productId as Any,
                    "expiresDate": result.subscription?.expiresDate.timeIntervalSince1970 as Any,
                    "startedAt": result.subscription?.startedAt?.timeIntervalSince1970 as Any,
                    "canceledAt": result.subscription?.canceledAt?.timeIntervalSince1970 as Any,
                    "isInRetryBilling": result.subscription?.isInRetryBilling as Any,
                    "isAutorenewEnabled": result.subscription?.isAutorenewEnabled as Any,
                    "isIntroductoryActivated": result.subscription?.isIntroductoryActivated as Any,
                    "isActive":  result.subscription?.isActive() as Any,
                    "status": result.subscription?.status.rawValue as Any
                ],
                "nonRenewingPurchase": [
                    "productId": result.nonRenewingPurchase?.productId as Any,
                    "purchasedAt": result.nonRenewingPurchase?.purchasedAt.timeIntervalSince1970 as Any,
                    "canceledAt": result.nonRenewingPurchase?.canceledAt?.timeIntervalSince1970 as Any
                ],
                "error": result.error.debugDescription
            ] as [String : Any];
            if (transaction != nil) {
                response["transaction"] = [
                    "transactionIdentifier": transaction?.transactionIdentifier as Any,
                    "transactionDate": transaction?.transactionDate?.timeIntervalSince1970 as Any,
                    "payment": [
                        "productIdentifier": transaction?.payment.productIdentifier as Any,
                        "description": transaction?.payment.description.description as Any,
                        "applicationUsername": transaction?.payment.applicationUsername as Any,
                        "quantity": transaction?.payment.quantity as Any
                    ]
                ]
            }
            resolve(response);
        }
    }
    
    @objc(subscription:withRejecter:)
    func subscription(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let subscription = Apphud.subscription();
        resolve([
            "productId": subscription?.productId as Any,
            "expiresDate": subscription?.expiresDate.timeIntervalSince1970 as Any,
            "startedAt": subscription?.startedAt?.timeIntervalSince1970 as Any,
            "canceledAt": subscription?.canceledAt?.timeIntervalSince1970 as Any,
            "isInRetryBilling": subscription?.isInRetryBilling as Any,
            "isAutorenewEnabled": subscription?.isAutorenewEnabled as Any,
            "isIntroductoryActivated": subscription?.isIntroductoryActivated as Any,
            "isActive":  subscription?.isActive() as Any,
            "status": subscription?.status.rawValue as Any,
        ]);
    }
    
    @objc(isNonRenewingPurchaseActive:withResolver:withRejecter:)
    func isNonRenewingPurchaseActive(productIdentifier: String, resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(
            Apphud.isNonRenewingPurchaseActive(productIdentifier: productIdentifier)
        );
    }
    
    @objc(nonRenewingPurchases:withRejecter:)
    func nonRenewingPurchases(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let purchases = Apphud.nonRenewingPurchases();
        resolve(
            purchases?.map({ (purchase) -> NSDictionary in
                return [
                    "productId": purchase.productId,
                    "canceledAt": purchase.canceledAt?.timeIntervalSince1970 as Any,
                    "purchasedAt": purchase.purchasedAt.timeIntervalSince1970 as Any
                ]
            })
        );
    }
    
    @objc(restorePurchases:withRejecter:)
    func restorePurchases(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        Apphud.restorePurchases { (subscriptions, purchases, error) in
            resolve([
                "subscriptions": subscriptions?.map{ (subscription) -> NSDictionary in
                    return [
                        "productId": subscription.productId as Any,
                        "expiresDate": subscription.expiresDate.timeIntervalSince1970 as Any,
                        "startedAt": subscription.startedAt?.timeIntervalSince1970 as Any,
                        "canceledAt": subscription.canceledAt?.timeIntervalSince1970 as Any,
                        "isInRetryBilling": subscription.isInRetryBilling as Any,
                        "isAutorenewEnabled": subscription.isAutorenewEnabled as Any,
                        "isIntroductoryActivated": subscription.isIntroductoryActivated as Any,
                        "isActive":  subscription.isActive() as Any,
                        "status": subscription.status.rawValue as Any,
                    ]
                } as Any,
                "purchases": purchases?.map{ (purchase) -> NSDictionary in
                    return [
                        "productId": purchase.productId,
                        "canceledAt": purchase.canceledAt?.timeIntervalSince1970 as Any,
                        "purchasedAt": purchase.purchasedAt.timeIntervalSince1970 as Any
                    ]
                } as Any,
                "error": error?.localizedDescription as Any,
            ])
        }
    }
    
    @objc(userId:withRejecter:)
    func userId(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(
            Apphud.userID()
        );
    }
    
    @objc(addAttribution:withResolver:withRejecter:)
    func addAttribution(options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        let data = options["data"] as! [AnyHashable : Any];
        let identifier = options["identifier"] as? String;
        let from:ApphudAttributionProvider? = ApphudAttributionProvider(rawValue: options["attributionProviderId"] as! Int);
        Apphud.addAttribution(data: data, from: from!, identifer: identifier) {  (result:Bool) in
            resolve(result);
        }
    }
    
    @objc(subscriptions:withRejecter:)
    func subscriptions(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        reject("Error method", "Unsupported method", nil);
    }
    
    @objc(syncPurchases:withRejecter:)
    func syncPurchases(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        reject("Error method", "Unsupported method", nil);
    }
    
    @objc(setUserProperty:withRejecter:)
    func setUserProperty(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        reject("Error method", "Unsupported method", nil);
    }
    
    @objc(incrementUserProperty:withRejecter:)
    func incrementUserProperty(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        reject("Error method", "Unsupported method", nil);
    }
}
