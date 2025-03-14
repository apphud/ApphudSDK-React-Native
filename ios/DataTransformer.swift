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
    var map = [
      "identifier": identifier,
      "isDefault": isDefault,
      "products": products.map({ product in
        return product.toMap();
      })
    ] as [String : Any]

    map["json"] = json
    map["experimentName"] = experimentName
    map["variationName"] = variationName

    return map as NSDictionary;
  }
}

extension ApphudProduct : RNAdapter {
  func toMap() -> NSDictionary {

    var map = [
      "store": store,
    ] as [String: Any]

    map["name"] = name
    map["paywallIdentifier"] = paywallIdentifier
    map["id"] = productId

    if let productMap = skProduct?.toMap() as? [String: Any] {
      map.merge(productMap, uniquingKeysWith: { old, new in return new})
    }

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
      "productId": productId,
      "expiresAt": expiresDate.timeIntervalSince1970,
      "startedAt": startedAt.timeIntervalSince1970,
      "canceledAt": canceledAt?.timeIntervalSince1970 as Any,
      "isInRetryBilling": isInRetryBilling,
      "isAutorenewEnabled": isAutorenewEnabled,
      "isIntroductoryActivated": isIntroductoryActivated,
      "isActive":  isActive(),
      "status": status.toString(),
    ] as NSDictionary
  }
}

extension ApphudNonRenewingPurchase : RNAdapter {
  func toMap() -> NSDictionary {
    [
      "productId": productId,
      "purchasedAt": purchasedAt.timeIntervalSince1970,
      "canceledAt": canceledAt?.timeIntervalSince1970 as Any,
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

