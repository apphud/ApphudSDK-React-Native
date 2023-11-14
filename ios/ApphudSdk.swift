import ApphudSDK
import StoreKit

@objc(ApphudSdk)
class ApphudSdk: NSObject {
    
    override init() {
        ApphudHttpClient.shared.sdkType = "reactnative";
        ApphudHttpClient.shared.sdkVersion = "1.3.0";
    }

    @objc(start:withResolver:withRejecter:)
    func start(options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let apiKey = options["apiKey"] as! String;
        let userID = options["userId"] as? String;
        let observerMode = options["observerMode"] as? Bool ?? true;
        DispatchQueue.main.async {
            #if DEBUG
            Apphud.enableDebugLogs()
            #endif
            Apphud.start(apiKey: apiKey, userID: userID, observerMode: observerMode);
            resolve(true);
        }
    }
    
    @objc(startManually:withResolver:withRejecter:)
    func startManually(options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let apiKey = options["apiKey"] as! String;
        let userID = options["userId"] as? String;
        let deviceID = options["deviceId"] as? String;
        let observerMode = options["observerMode"] as? Bool ?? true;
        DispatchQueue.main.async {
            Apphud.startManually(apiKey: apiKey, userID: userID, deviceID: deviceID, observerMode: observerMode);
            resolve(true);
        }
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

    @objc(hasPremiumAccess:withRejecter:)
    func hasPremiumAccess(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(Apphud.hasPremiumAccess());
    }

    @objc(products:withRejecter:)
    func products(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let products:[SKProduct]? = Apphud.products;
        resolve(
            products?.map{ (product) -> NSDictionary in
                DataTransformer.skProduct(product: product);
            }
        );
    }

    @objc(purchase:withResolver:withRejecter:)
    func purchase(args: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {

        guard let productId = args["productId"] as? String, productId.count > 0 else {
            reject("Error", "ProductId not set", nil)
            return
        }
        let paywallId = args["paywallId"] as? String

        Task {
            var product: ApphudProduct?
            let paywalls = await Apphud.paywalls()

            for paywall in paywalls where product == nil {
                product = paywall.products.first { product in
                    return product.productId == productId && ((paywallId?.count ?? 0 == 0) || product.paywallIdentifier == paywallId)
                }
            }

            guard let product = product else {
                reject("Error", "Product not found", nil);
                return
            }

            Apphud.purchase(product) { result in
                DispatchQueue.main.async {

                    var response = [String: Any]()

                    response["success"] = result.error == nil

                    let sub = result.subscription.map { DataTransformer.apphudSubscription(subscription: $0) }
                    let non = result.nonRenewingPurchase.map { DataTransformer.nonRenewingPurchase(nonRenewingPurchase: $0) }

                    if let skError = result.error as? SKError, skError.code == .paymentCancelled {
                        response["userCanceled"] = NSNumber(booleanLiteral: true)
                    }

                    if let sub = sub {
                        response["subscription"] = sub
                    }
                    if let non = non {
                        response["nonRenewingPurchase"] = non
                    }

                    if let err = result.error as? NSError {
                        response["error"] = [
                            "code": err.code,
                            "message": err.localizedDescription,
                        ]
                    }

                    if let transaction = result.transaction {
                        response["appStoreTransaction"] = [
                            "state": transaction.transactionState.rawValue,
                            "id": transaction.transactionIdentifier as Any,
                            "date": transaction.transactionDate?.timeIntervalSince1970 as Any,
                            "productId": transaction.payment.productIdentifier
                        ]
                    }

                    resolve(response);
                }
            }
        }
    }
   
    @objc(paywalls:withRejecter:)
    func paywalls(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Apphud.paywallsDidLoadCallback { paywalls in
            resolve(
                paywalls.map({ paywall in
                    return paywall.toMap();
                })
            );
        }
    }
    
    @objc(submitPushNotificationsToken:withResolver:withRejecter:)
    func submitPushNotificationsToken(token:String,  resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        guard let data: Data = token.data(using: .utf8) else {
            reject("Error", "Invalid Push Token", nil)
            return
        }

        Apphud.submitPushNotificationsToken(token: data) { result in
            resolve(result);
        }
    }
    
    @objc(apsInfo:withResolver:withRejecter:)
    func handlePushNotification(apsInfo: NSDictionary,  resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        var payload = [String: AnyHashable]();
        apsInfo.allKeys.forEach { key in
            if let prop: String = key as? String, let value = apsInfo[prop] as? AnyHashable {
                payload[prop] = value
            }
        }
        resolve(
            Apphud.handlePushNotification(apsInfo: payload)
        )
    }
    
    @objc(subscription:withRejecter:)
    func subscription(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        guard let subscription = Apphud.subscription() else {
            reject("Error", "User has no subscriptions", nil)
            return
        }

        resolve(DataTransformer.apphudSubscription(subscription: subscription));
    }

    @objc(subscriptions:withRejecter:)
    func subscriptions(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let subs = Apphud.subscriptions() ?? []
        let array: Array = subs.map { DataTransformer.apphudSubscription(subscription: $0) }
        resolve(array as NSArray)
    }

    @objc(isNonRenewingPurchaseActive:withResolver:withRejecter:)
    func isNonRenewingPurchaseActive(productIdentifier: String, resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(
            Apphud.isNonRenewingPurchaseActive(productIdentifier: productIdentifier)
        );
    }
    
    @objc(nonRenewingPurchases:withRejecter:)
    func nonRenewingPurchases(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let purchases = Apphud.nonRenewingPurchases() ?? []
        let array: Array = purchases.map { DataTransformer.nonRenewingPurchase(nonRenewingPurchase: $0) }
        resolve(array)
    }
    
    @objc(restorePurchases:withRejecter:)
    func restorePurchases(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        Apphud.restorePurchases { (subscriptions, purchases, error) in
            resolve([
                "subscriptions": subscriptions?.map{ DataTransformer.apphudSubscription(subscription: $0) } as Any,
                "purchases": purchases?.map {
                    [
                        "productId": $0.productId,
                        "canceledAt": $0.canceledAt?.timeIntervalSince1970 as Any,
                        "purchasedAt": $0.purchasedAt.timeIntervalSince1970 as Any
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

        guard let data = options["data"] as? [AnyHashable : Any], let identifier = options["identifier"]  as? String, let idInteger = options["attributionProviderId"] as? Int, let provider = ApphudAttributionProvider(rawValue: idInteger) else {
            reject("Error", "Invalid Attribution Options", nil)
            return
        }

        Apphud.addAttribution(data: data, from: provider, identifer: identifier) {  result in
            resolve(result)
        }
    }
    
    @objc(appStoreReceipt:withRejecter:)
    func appStoreReceipt(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        resolve(
            Apphud.appStoreReceipt()
        );
    }
    
    @objc(setUserProperty:withValue:withSetOnce:withResolver:withRejecter:)
    func setUserProperty(key: String, value: String, setOnce: Bool, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let _key = ApphudUserPropertyKey.init(key)
        resolve(Apphud.setUserProperty(key: _key, value: value, setOnce: setOnce));
    }
    
    @objc(incrementUserProperty:withBy:withResolver:withRejecter:)
    func incrementUserProperty(key: String, by: String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        let _key = ApphudUserPropertyKey.init(key)
        resolve(Apphud.incrementUserProperty(key: _key, by: by));
    }

    @objc(syncPurchasesInObserverMode:withRejecter:)
    func syncPurchasesInObserverMode(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
        Apphud.restorePurchases { _, _, _ in
            resolve(true)
        }
    }
}
