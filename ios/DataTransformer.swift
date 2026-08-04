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

/// JS-facing shape of an `NSError`. Mirrors `LoadingViewError` in `src/view/types.ts`.
struct SerializedError: RNAdapter {
  let code: Int
  let userInfo: [AnyHashable: Any]?
  let localizedDescription: String
  let domain: String

  init(from error: NSError) {
    self.code = error.code
    self.userInfo = error.userInfo
    self.localizedDescription = error.localizedDescription
    self.domain = error.domain
  }

  func toMap() -> NSDictionary {
    var map: [AnyHashable: Any] = [:]
    map["code"] = code
    map["userInfo"] = userInfo
    map["localizedDescription"] = localizedDescription
    map["domain"] = domain

    return map as NSDictionary
  }
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
    if #available(iOS 12.2, *) {
      if !discounts.isEmpty {
        map["discounts"] = discounts.map { ($0 as SKProductDiscount).toMap() }
      }
    }
    map["id"] = productIdentifier
    map["store"] = "app_store"
    return map as NSDictionary
  }
}

extension ApphudRule {
  func toMap() -> [String: Any?] {
    return [
      "ruleName": rule_name,
      "screenName": screen_name,
      "screenId": screen_id,
      "paywallId": paywall_id,
      "paywallIdentifier": paywall_identifier,
    ]
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
    map["hasVisualPaywall"] = screen != nil
    map["json"] = json

    return map as NSDictionary;
  }
}

fileprivate func apphudAnyCodableToJSONObject(_ codable: ApphudAnyCodable) -> Any {
  guard let data = try? JSONEncoder().encode(codable),
        let json = try? JSONSerialization.jsonObject(with: data) else {
    return NSNull()
  }
  return json
}

fileprivate func apphudAnyCodablePropertiesToMap(_ properties: [String: ApphudAnyCodable]?) -> [String: Any]? {
  guard let properties else { return nil }
  return Dictionary(uniqueKeysWithValues: properties.map { ($0.key, apphudAnyCodableToJSONObject($0.value)) })
}

extension ApphudProduct : RNAdapter {
  func toMap() -> NSDictionary {
    var map: [String: Any] = [:]
    
    map["productId"] = productId
    map["name"] = name
    map["store"] = store
    map["skProduct"] = skProduct?.toMap()
    map["paywallIdentifier"] = paywallIdentifier
    map["placementIdentifier"] = placementIdentifier
    map["variationIdentifier"] = variationIdentifier
    map["experimentId"] = experimentId
    if let propertiesMap = apphudAnyCodablePropertiesToMap(properties) {
      map["properties"] = propertiesMap
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
      "identifier": identifier,
      "price": price.floatValue,
      "numberOfPeriods": numberOfPeriods,
      "subscriptionPeriod": subscriptionPeriod.toMap(),
      "paymentMode": paymentMode.rawValue,
    ]
  }
}

extension ApphudUser : RNAdapter {
  @MainActor
  func toMap() -> NSDictionary {
    var map: [String: Any] = [
      "userId": userId,
      "subscriptions": subscriptions.map({ $0.toMap() }),
      "purchases": purchases.map { $0.toMap() },
      "totalDevicesCount": totalDevicesCount,
      "remoteConfig": remoteConfig(),
    ]
    map["experimentName"] = experimentName
    map["variationName"] = variationName
    map["targetingName"] = targetingName
    map["remoteConfigString"] = remoteConfigString
    map["rawPlacements"] = rawPlacements().map { $0.toMap() }
    return map as NSDictionary
  }
}

extension ApphudPlacement : RNAdapter {
  func toMap() -> NSDictionary {
    return [
      "identifier": identifier,
      "paywall": paywall?.toMap() as Any,
      "experimentName": experimentName as Any,
      "variationName": variationName as Any,
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
      "isAutoRenewEnabled": isAutorenewEnabled,
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

struct AttributionParams {
  let identifier: String?
  let provider: ApphudAttributionProvider
  let data: ApphudAttributionData
}

fileprivate extension String {
  func toApphudAttributionProvider() -> ApphudAttributionProvider? {
    switch self {
    case "appsFlyer":
      return .appsFlyer
    case "adjust":
      return .adjust
    case "appleAdsAttribution":
      return .appleAdsAttribution
    case "branch":
      return .branch
    case "firebase":
      return .firebase
    case "facebook":
      return .facebook
    case "singular":
      return .singular
    case "tenjin":
      return .tenjin
    case "tiktok":
      return .tiktok
    case "voluum":
      return .voluum
    case "custom":
      return .custom
      
    default:
      return nil
    }
  }
}

extension NSDictionary {
  func getAttributionParams() -> AttributionParams? {
    let identifier = self["identifier"] as? String
    
    guard let attributionProviderId = self["attributionProviderId"] as? String, let provider = attributionProviderId.toApphudAttributionProvider(), let data = self["data"] as? [AnyHashable : Any] else {
      return nil
    }
    
    let rawData = data["rawData"] as? [AnyHashable : Any] ?? [:]

    let attributionData = ApphudAttributionData(
      rawData: rawData,
      adNetwork: data["adNetwork"] as? String,
      channel: data["channel"] as? String,
      campaign: data["campaign"] as? String,
      adSet: data["adSet"] as? String,
      creative: data["creative"] as? String,
      keyword: data["keyword"] as? String,
      custom1: data["custom1"] as? String,
      custom2: data["custom2"] as? String
    )

    return AttributionParams(
      identifier: identifier,
      provider: provider,
      data: attributionData
    )
  }
}

extension ApphudPurchaseResult : RNAdapter {
  func toMap() -> NSDictionary {
    var map: [String: Any] = [:]
    map["subscription"] = subscription?.toMap()
    map["nonRenewingPurchase"] = nonRenewingPurchase?.toMap()
    map["isRestoreResult"] = isRestoreResult
    map["success"] = success
    
    map["error"] = error?.localizedDescription
    if let aphError = error as? ApphudError {
      map["error_code"] = aphError.code
    }
    
    return map as NSDictionary
  }
}
