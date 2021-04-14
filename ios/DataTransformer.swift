//
//  SKProductDictionary.swift
//  ApphudSDK
//
//  Created by Alexandr Makarov on 4/8/21.
//

import Foundation
import StoreKit
import ApphudSDK

public class DataTransformer {
    public static func skProduct(product: SKProduct) -> NSDictionary {
        return [
            "id": product.productIdentifier,
            "price": product.price,
            "regionCode": product.priceLocale.regionCode as Any,
            "currencyCode": product.priceLocale.currencyCode as Any,
        ];
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

