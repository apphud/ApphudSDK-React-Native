//
//  SKProductDictionary.swift
//  ApphudSDK
//
//  Created by Alexandr Makarov on 4/8/21.
//

import Foundation
import StoreKit
import ApphudSDK

extension SKProduct {
  func toMap() -> NSDictionary {

    var map = [
        "localizedTitle": localizedTitle,
        "priceLocale": priceLocale.toMap(),
        "price": price.floatValue,
    ] as [String : Any]

      map["subscriptionPeriod"] = subscriptionPeriod?.toMap()
      map["introductoryPrice"] = introductoryPrice?.toMap()

    return map as NSDictionary
  }
}

extension ApphudPaywall {
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

extension ApphudProduct {
    func toMap() -> NSDictionary {

        var map = [
            "store": store,
        ] as [String: Any]

        map["name"] = name
        map["paywallIdentifier"] = paywallIdentifier

        if let productMap = skProduct?.toMap() as? [String: Any] {
            map.merge(productMap, uniquingKeysWith: { old, new in return new})
        }

        return map as NSDictionary;
    }
}

extension Locale {
  func toMap() -> NSDictionary {
    return [
        "currencySymbol": currencySymbol ?? "",
        "currencyCode": currencyCode ?? "",
        "countryCode": regionCode ?? "",
    ]
  }
}

extension SKProductSubscriptionPeriod {
  func toMap() -> NSDictionary {
    return [
      "numberOfUnits": numberOfUnits,
      "unit": unit.rawValue
    ]
  }
}

extension SKProductDiscount {
  func toMap() -> NSDictionary {
    return [
        "price": price.floatValue,
        "numberOfPeriods": numberOfPeriods,
        "subscriptionPeriod": subscriptionPeriod.toMap(),
        "paymentMode": paymentMode.rawValue,
    ]
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

public class DataTransformer {
    public static func skProduct(product: SKProduct) -> NSDictionary {
        return product.toMap();
    }
    
    public static func apphudSubscription(subscription: ApphudSubscription) -> NSDictionary {
        [
            "productId": subscription.productId,
            "expiresAt": subscription.expiresDate.timeIntervalSince1970,
            "startedAt": subscription.startedAt.timeIntervalSince1970,
            "canceledAt": subscription.canceledAt?.timeIntervalSince1970 as Any,
            "isInRetryBilling": subscription.isInRetryBilling,
            "isAutorenewEnabled": subscription.isAutorenewEnabled,
            "isIntroductoryActivated": subscription.isIntroductoryActivated,
            "isActive":  subscription.isActive(),
            "status": subscription.status.toString(),
            ] as NSDictionary
    }
    
    public static func nonRenewingPurchase(nonRenewingPurchase: ApphudNonRenewingPurchase) -> NSDictionary {
        [
            "productId": nonRenewingPurchase.productId,
            "purchasedAt": nonRenewingPurchase.purchasedAt.timeIntervalSince1970,
            "canceledAt": nonRenewingPurchase.canceledAt?.timeIntervalSince1970 as Any,
            "isActive": nonRenewingPurchase.isActive()
        ] as NSDictionary
    }
}

