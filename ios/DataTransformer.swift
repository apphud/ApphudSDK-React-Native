//
//  SKProductDictionary.swift
//  ApphudSDK
//
//  Created by Alexandr Makarov on 4/8/21.
//

import Foundation
import StoreKit
import ApphudSDK

protocol RNAdapter {
  func toMap() -> NSDictionary
}

extension SKProduct : RNAdapter {
  func toMap() -> NSDictionary {

    var map = [
      "localizedTitle": localizedTitle,
      "priceLocale": priceLocale.toMap(),
      "price": price.floatValue,
    ] as [String : Any]

    map["subscriptionPeriod"] = subscriptionPeriod?.toMap()
    map["introductoryPrice"] = introductoryPrice?.toMap()
    map["id"] = productIdentifier
    map["store"] = "app_store"
    return map as NSDictionary
  }
}

extension ApphudPaywall : RNAdapter {
  func toMap() -> NSDictionary {
    var map: [String: Any] = [:]
    
    map["products"] = products.map({ $0.toMap() })
    map["identifier"] = identifier
    map["isDefault"] = isDefault
    map["experimentName"] = experimentName
    map["variationName"] = variationName
    map["parentPaywallIdentifier"] = parentPaywallIdentifier
    map["placementIdentifier"] = placementIdentifier
    map["json"] = json

    return map as NSDictionary;
  }
}

extension ApphudProduct : RNAdapter {
  func toMap() -> NSDictionary {
    var map: [String: Any] = [:]
    
    map["productId"] = productId
    map["name"] = name
    map["store"] = store
    map["skProduct"] = skProduct?.toMap()
    map["paywallIdentifier"] = paywallIdentifier
  
    return map as NSDictionary;
  }
}

extension Locale : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "currencySymbol": currencySymbol ?? "",
      "currencyCode": currencyCode ?? "",
      "countryCode": regionCode ?? "",
    ]
  }
}

extension SKProductSubscriptionPeriod : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "numberOfUnits": numberOfUnits,
      "unit": unit.rawValue
    ]
  }
}

extension SKProductDiscount : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "price": price.floatValue,
      "numberOfPeriods": numberOfPeriods,
      "subscriptionPeriod": subscriptionPeriod.toMap(),
      "paymentMode": paymentMode.rawValue,
    ]
  }
}

extension ApphudUser : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "userId": userId,
      "subscriptions": subscriptions.map({ $0.toMap() }),
      "purchases": purchases.map { $0.toMap() }
    ]
  }
}

extension ApphudPlacement : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "identifier": identifier,
      "paywall": paywall?.toMap() as Any,
      "experimentName": experimentName as Any,
    ]
  }
}

extension ApphudSubscription : RNAdapter {
  func toMap() -> NSDictionary {
    [
      "isActive": isActive(),
      "status": status.toString(),
      "productId": productId,
      "expiresAt": expiresDate.timeIntervalSince1970,
      "startedAt": startedAt.timeIntervalSince1970,
      "canceledAt": canceledAt?.timeIntervalSince1970 as Any,
      "isSandbox": isSandbox,
      "isLocal": isLocal,
      "isInRetryBilling": isInRetryBilling,
      "isAutorenewEnabled": isAutorenewEnabled,
      "kind": "autorenewable",
      "isIntroductoryActivated": isIntroductoryActivated
    ] as NSDictionary
  }
}

extension ApphudNonRenewingPurchase : RNAdapter {
  func toMap() -> NSDictionary {
    [
      "productId": productId,
      "purchasedAt": purchasedAt.timeIntervalSince1970,
      "canceledAt": canceledAt?.timeIntervalSince1970 as Any,
      "isSandbox": isSandbox,
      "isLocal": isLocal,
      "isActive": isActive()
    ] as NSDictionary
  }
}

extension ApphudSubscriptionStatus {
  func toString() -> String {
    switch self {
    case .trial:
      return "trial"
    case .intro:
      return "intro"
    case .regular:
      return "regular"
    case .promo:
      return "promo"
    case .grace:
      return "grace"
    case .expired:
      return "expired"
    case .refunded:
      return "refunded"
    }
  }
}

