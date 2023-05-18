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
    let map: NSDictionary = [
        "id": productIdentifier,
        "localizedTitle": localizedTitle,
        "localizedDescription": localizedDescription,
        "priceLocale": priceLocale.toMap(),
        "price": price.floatValue,
        "subscriptionPeriod": subscriptionPeriod?.toMap() as Any,
        "introductoryPrice": introductoryPrice?.toMap() as Any,
    ]
    return map
  }
}

extension ApphudPaywall {
    func toMap() -> NSDictionary {
        let map: NSDictionary = [
            "identifier": identifier,
            "isDefault": isDefault,
            "experimentName": experimentName,
            "variationName": variationName,
            "json": json,
            "products": products.map({ product in
                return product.toMap();
            })
        ]
        return map;
    }
}

extension ApphudProduct {
    func toMap() -> NSDictionary {
        let map: NSDictionary = [
            "productId": productId,
            "name": name,
            "store": store,
            "paywallId": paywallId,
            "paywallIdentifier": paywallIdentifier,
            "product": skProduct?.toMap(),
        ];
        return map;
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

@available(iOS 11.2, *)
extension SKProductSubscriptionPeriod {
  func toMap() -> NSDictionary {
    return [
      "numberOfUnits": numberOfUnits,
      "unit": unit.rawValue
    ]
  }
}

@available(iOS 11.2, *)
extension SKProductDiscount {
  func toMap() -> NSDictionary {
    return [
        "price": price.floatValue,
        "priceLocale": ["":""],
        "numberOfPeriods": numberOfPeriods,
        "subscriptionPeriod": subscriptionPeriod.toMap(),
        "paymentMode": paymentMode.rawValue,
    ]
  }
}

public class DataTransformer {
    public static func skProduct(product: SKProduct) -> NSDictionary {
        return product.toMap();
    }
    
    public static func apphudSubscription(subscription: ApphudSubscription?) -> NSDictionary {
        var result:NSDictionary = NSDictionary();
        if (subscription != nil) {
            result = [
                "productId": subscription!.productId as Any,
                "expiresDate": subscription!.expiresDate.timeIntervalSince1970 as Any,
                "startedAt": subscription!.startedAt.timeIntervalSince1970 as Any,
                "canceledAt": subscription?.canceledAt?.timeIntervalSince1970 as Any,
                "isInRetryBilling": subscription!.isInRetryBilling as Any,
                "isAutorenewEnabled": subscription!.isAutorenewEnabled as Any,
                "isIntroductoryActivated": subscription!.isIntroductoryActivated as Any,
                "isActive":  subscription!.isActive() as Any,
                "status": subscription!.status.rawValue as Any,
                "isLocal": subscription!.isLocal as Any,
                "isSandbox": subscription!.isSandbox as Any
            ]
        }
        return result;
    }
    
    public static func nonRenewingPurchase(nonRenewingPurchase: ApphudNonRenewingPurchase?) -> NSDictionary {
        var result:NSDictionary = NSDictionary();
        if (nonRenewingPurchase != nil) {
            result = [
                "productId": nonRenewingPurchase!.productId as Any,
                "purchasedAt": nonRenewingPurchase!.purchasedAt.timeIntervalSince1970 as Any,
                "canceledAt": nonRenewingPurchase?.canceledAt?.timeIntervalSince1970 as Any,
                "isLocal": nonRenewingPurchase!.isLocal as Any,
                "isSandbox": nonRenewingPurchase!.isSandbox as Any
            ]
        }
        return result;
    }
}

