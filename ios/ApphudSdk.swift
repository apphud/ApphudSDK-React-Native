import ApphudSDK
import StoreKit

@objc(ApphudSdk)
class ApphudSdk: NSObject {

  private func applyBaseUrl(from options: NSDictionary) {
    if let baseUrl = options["baseUrl"] as? String, !baseUrl.isEmpty {
      ApphudHttpClient.shared.domainUrlString = baseUrl
    }
  }
    
  override init() {
    ApphudHttpClient.shared.sdkType = "reactnative"
    let current = ApphudHttpClient.shared.sdkVersion
    if !current.contains("(") {
      ApphudHttpClient.shared.sdkVersion = ApphudSdkVersion.value + "(\(current))"
    }
  }

  @objc(start:withResolver:withRejecter:)
  func start(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    
    guard let apiKey = options["apiKey"] as? String else {
      reject("Error", "apiKey not set", nil)
      return
    }
    
    let userID = options["userId"] as? String;
    let observerMode = options["observerMode"] as? Bool ?? false;
    applyBaseUrl(from: options)
    
    DispatchQueue.main.async {
#if DEBUG
      ApphudUtils.enableAllLogs()
#endif
      
      Apphud
        .start(
          apiKey: apiKey,
          userID: userID,
          observerMode: observerMode
        ) { user in
          Task { @MainActor in
            resolve(user.toMap())
          }
        }
    }
  }
    
  @objc(startManually:withResolver:withRejecter:)
  func startManually(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard let apiKey = options["apiKey"] as? String else {
      reject("Error", "apiKey not set", nil)
      return
    }

    let userID = options["userId"] as? String;
    let deviceID = options["deviceId"] as? String;
    let observerMode = options["observerMode"] as? Bool ?? false;
    applyBaseUrl(from: options)
    DispatchQueue.main.async {
      Apphud
        .startManually(
          apiKey: apiKey,
          userID: userID,
          deviceID: deviceID,
          observerMode: observerMode
        ) { user in
          Task { @MainActor in
            resolve(user.toMap())
          }
        }
    }
  }

  @objc(setHost:)
  func setHost(url: String) {
    ApphudHttpClient.shared.domainUrlString = url
  }

  @MainActor
  @objc(attributeFromDeeplink:withRejecter:)
  func attributeFromDeeplink(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    Apphud.attributeFromDeeplink { data in
      resolve(data as Any?)
    }
  }

  @objc(rawPlacements:withRejecter:)
  func rawPlacements(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      resolve(Apphud.rawPlacements().map { $0.toMap() })
    }
  }

  @objc(placement:options:withResolver:withRejecter:)
  func placement(
    identifier: String,
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    Task { @MainActor in
      if let placement = await Apphud.placement(identifier) {
        resolve(placement.toMap())
      } else {
        resolve(NSNull())
      }
    }
  }

  @objc(isCommitmentPlanPreferred:withResolver:withRejecter:)
  func isCommitmentPlanPreferred(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let productId = options["productId"] as? String, !productId.isEmpty else {
      reject("Error", "productId not set", nil)
      return
    }
    let placementId = options["placementIdentifier"] as? String
    let paywallId = options["paywallIdentifier"] as? String
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = options["forceRefresh"] as? Bool ?? false

    Task { @MainActor in
      guard let product = await ApphudPaywallsHelper.findProduct(
        productId: productId,
        placementIdentifier: placementId,
        paywallIdentifier: paywallId,
        maxAttempts: maxAttempts,
        forceRefresh: forceRefresh
      ) else {
        resolve(false)
        return
      }
      resolve(product.isCommitmentPlanPreferred())
    }
  }

  @objc(isCommitmentPlanSupported:withResolver:withRejecter:)
  func isCommitmentPlanSupported(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let productId = options["productId"] as? String, !productId.isEmpty else {
      reject("Error", "productId not set", nil)
      return
    }
    let placementId = options["placementIdentifier"] as? String
    let paywallId = options["paywallIdentifier"] as? String
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = options["forceRefresh"] as? Bool ?? false

    Task { @MainActor in
      guard let product = await ApphudPaywallsHelper.findProduct(
        productId: productId,
        placementIdentifier: placementId,
        paywallIdentifier: paywallId,
        maxAttempts: maxAttempts,
        forceRefresh: forceRefresh
      ) else {
        resolve(false)
        return
      }
      if #available(iOS 26.4, *) {
        let supported = await product.isCommitmentPlanSupported()
        resolve(supported)
      } else {
        resolve(false)
      }
    }
  }
  
  @MainActor
  @objc(refreshUserData:withRejecter:)
  func refreshUserData(resolve: @escaping RCTPromiseResolveBlock,
                       reject: RCTPromiseRejectBlock) {
    Apphud.refreshUserData { user in
      resolve(user?.toMap())
    }
  }
    
  @objc(logout:withRejecter:)
  func logout(
    resolve: @escaping RCTPromiseResolveBlock,
    reject:RCTPromiseRejectBlock
  ) {
    Task {
      await Apphud.logout()
      resolve(nil)
    }
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
  func products(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    Apphud.fetchProducts { products, error in
      
      resolve(products.map { $0.toMap() });
    }
  }
  
  @objc(purchase:withResolver:withRejecter:)
  func purchase(args: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {

    guard let productId = args["productId"] as? String, productId.count > 0 else {
      reject("Error", "ProductId not set", nil)
      return
    }
    let paywallId = args["paywallIdentifier"] as? String
    let placementId = args["placementIdentifier"] as? String

    let maxAttempts = args["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = args["forceRefresh"] as? Bool ?? false

    Task { @MainActor in
      guard let product = await ApphudPaywallsHelper.findProduct(
        productId: productId,
        placementIdentifier: placementId,
        paywallIdentifier: paywallId,
        maxAttempts: maxAttempts,
        forceRefresh: forceRefresh
      ) else {
        reject("Error", "Product not found", nil);
        return
      }
      
      Apphud.purchase(product) { result in
        DispatchQueue.main.async {

          var response = [String: Any]()

          response["success"] = result.error == nil

          let sub = result.subscription.map {
            $0.toMap()
          }
          let non = result.nonRenewingPurchase.map { $0.toMap() }

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
            response["transaction"] = [
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

  @objc(paywallShown:)
  func paywallShown(options: [AnyHashable : Any]) {
    let placementIdentifier = options["placementIdentifier"] as? String
    let paywallIdentifier = options["paywallIdentifier"] as? String
    
    if placementIdentifier == nil && paywallIdentifier == nil {
      return
    }
    
    Task { @MainActor in
      let paywall = await ApphudPaywallsHelper.getPaywall(options: options)

      if let paywall {
        Apphud.paywallShown(paywall)
      }
    }
  }

  @MainActor @objc(subscription:withRejecter:)
  func subscription(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    guard let subscription = Apphud.subscription() else {
      reject("Error", "User has no subscriptions", nil)
      return
    }

    resolve(subscription.toMap());
  }

    
  @MainActor @objc(subscriptions:withRejecter:)
  func subscriptions(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    let subs = Apphud.subscriptions() ?? []
    let array: Array = subs.map { $0.toMap() }
    resolve(array as NSArray)
  }

  @MainActor @objc(isNonRenewingPurchaseActive:withResolver:withRejecter:)
  func isNonRenewingPurchaseActive(productIdentifier: String, resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    resolve(
      Apphud.isNonRenewingPurchaseActive(productIdentifier: productIdentifier)
    );
  }

  @MainActor @objc(nonRenewingPurchases:withRejecter:)
  func nonRenewingPurchases(resolve: RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    let purchases = Apphud.nonRenewingPurchases() ?? []
    let array: Array = purchases.map { $0.toMap() }
    resolve(array)
  }
    
  @MainActor @objc(restorePurchases:withRejecter:)
  func restorePurchases(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    Apphud.restorePurchases { result in
      resolve(
        [
          "subscriptions": (result.subscription != nil) ? [result.subscription?.toMap()] : [],
          "purchases": [],
          "error": result.error?.localizedDescription as Any
        ]
      )
    }
  }
    
  @MainActor @objc(userId:withRejecter:)
  func userId(resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    resolve(
      Apphud.userID()
    );
  }
    
  @objc(setAttribution:withResolver:withRejecter:)
  func setAttribution(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject:RCTPromiseRejectBlock
  ) {
    guard let attributionParams = options.getAttributionParams() else {
      reject("Error", "Options not valid", nil)
      return
    }

    Apphud
      .setAttribution(
        data: attributionParams.data,
        from: attributionParams.provider,
        identifer: attributionParams.identifier
      ) { res, dict in
        resolve(res)
      }
  }

  @objc(setUserProperty:)
  func setUserProperty(options: NSDictionary) {
    guard let key = options["key"] as? String else {return}
        
    let value = options["value"]
    let setOnce: Bool = (options["setOnce"] as? Bool) ?? false
    let _key = ApphudUserPropertyKey.init(key)
    Apphud.setUserProperty(key: _key, value: value, setOnce: setOnce)
  }
    
  @objc(incrementUserProperty:)
  func incrementUserProperty(options: NSDictionary) {
    guard let key = options["key"] as? String, let by = options["by"] else {
      return
    }

    let _key = ApphudUserPropertyKey.init(key)
    Apphud.incrementUserProperty(key: _key, by: by)
  }

  // TODO
  @MainActor @objc(syncPurchasesInObserverMode:withRejecter:)
  func syncPurchasesInObserverMode(resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) -> Void {
    Apphud.restorePurchases { result in
      resolve(result.error == nil)
    }
  }

  @objc(setDeviceIdentifiers:)
  func setDeviceIdentifiers(options: NSDictionary) {
    let idfa = options["idfa"] as? String
    let idfv = options["idfv"] as? String
    
    Apphud.setDeviceIdentifiers(idfa: idfa, idfv: idfv)
  }

  @objc(enableDebugLogs)
  func enableDebugLogs() {
    ApphudUtils.enableAllLogs()
  }

  @objc(optOutOfTracking)
  func optOutOfTracking() {
    Apphud.optOutOfTracking()
  }

  @objc(collectDeviceIdentifiers)
  func collectDeviceIdentifiers() {
    // do nothing
  }

  @objc(submitPushNotificationsToken:)
  func submitPushNotificationsToken(token:String) {
    Apphud.submitPushNotificationsTokenString(string: token, callback: nil)
  }

  @objc(handlePushNotification:)
  func handlePushNotification(apsInfo: NSDictionary) -> Void {
    if let payload = apsInfo as? [AnyHashable: Any] {
      DispatchQueue.main.async {
        Apphud.handlePushNotification(apsInfo: payload)
      }
    }
  }
  
  @MainActor @objc(attributeFromWeb:withResolver:withRejecter:)
  func attributeFromWeb(
    data: [AnyHashable: Any],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock) {
      Apphud.attributeFromWeb(data: data) { success, user in
      
        var result: [String: Any] = [:]
      
        if let userId = user?.userId {
          result["userId"] = userId
        }
      
        result["isPremium"] = Apphud.hasPremiumAccess()
        result["result"] = success
      
        resolve(result)
      }
    }
  
  @MainActor @objc(placements:withResolver:withRejecter:)
  func placements(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = options["forceRefresh"] as? Bool ?? false
    
    Apphud.fetchPlacements(maxAttempts: maxAttempts, forceRefresh: forceRefresh) { placements, error in
      if let error {
        reject("Error", error.localizedDescription, nil)
        return
      }
      
      resolve(placements.map({ $0.toMap() }))
    }
  }
  
  @MainActor
  @objc(preloadPaywallScreens:)
  func preloadPaywallScreens(placementIdentifiers: [String]) {
    Apphud.preloadPaywallScreens(placementIdentifiers: placementIdentifiers)
  }

  @MainActor
  @objc(unloadPaywallScreen:withResolver:withRejecter:)
  func unloadPaywallScreen(
    options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let placementIdentifier = options["placementIdentifier"] as? String else {
      reject("Error", "Param placementIdentifier is required", nil)
      return
    }
    
    let maxAttempts = options["maxAttempts"] as? Int ?? APPHUD_DEFAULT_RETRIES
    let forceRefresh = options["forceRefresh"] as? Bool ?? false
    
    Apphud.fetchPlacements(maxAttempts: maxAttempts, forceRefresh: forceRefresh) { [resolve, reject] placements, error in
      if let error {
        reject("Error", error.localizedDescription, nil)
        return
      }

      let placement = placements.first { placement in
        placement.identifier == placementIdentifier
      }
      
      guard let paywall = placement?.paywall else {
        reject("Error", "Paywall not found", nil)
        return
      }
      
      Apphud.unloadPaywallScreen(paywall)
      resolve(nil)
    }
  }
  
  @objc(idfv:withRejecter:)
  func idfv(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(UIDevice.current.identifierForVendor?.uuidString)
  }
  
  @MainActor
  @objc(updateUserID:withResolver:withRejecter:)
  func updateUserID(userID: String, resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    Apphud.updateUserID(userID) { user in
      Task { @MainActor in
        resolve(user?.toMap())
      }
    }
  }
}
