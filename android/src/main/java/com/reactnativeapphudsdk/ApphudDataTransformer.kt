package com.reactnativeapphudsdk

import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.ProductDetails.OneTimePurchaseOfferDetails
import com.android.billingclient.api.ProductDetails.PricingPhase
import com.android.billingclient.api.ProductDetails.SubscriptionOfferDetails
import com.android.billingclient.api.Purchase
import com.apphud.sdk.ApphudPurchaseResult
import com.apphud.sdk.domain.ApphudNonRenewingPurchase
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudPlacement
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.domain.ApphudSubscription
import com.apphud.sdk.domain.ApphudUser
import com.apphud.sdk.managers.subscriptionPeriod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

internal fun Map<String, Any>.toWritableNativeMap(): WritableNativeMap {
  val writableMap = WritableNativeMap()

  for ((key, value) in this) {
    when (value) {
      is String -> writableMap.putString(key, value)
      is Int -> writableMap.putInt(key, value)
      is Double -> writableMap.putDouble(key, value)
      is Boolean -> writableMap.putBoolean(key, value)
      is Map<*, *> ->
        (value as? Map<String, Any>)?.let {
          writableMap.putMap(key, it.toWritableNativeMap())
        }
      is List<*> ->
        (value as? List<Any>)?.let {
          writableMap.putArray(key, value.toWritableNativeArray())
        }
    }
  }

  return writableMap
}

internal fun List<Any>.toWritableNativeArray(): WritableNativeArray {
  val writableArray = WritableNativeArray()

  for (value in this) {
    when (value) {
      is String -> writableArray.pushString(value)
      is Int -> writableArray.pushInt(value)
      is Double -> writableArray.pushDouble(value)
      is Boolean -> writableArray.pushBoolean(value)
      is Map<*, *> ->
        (value as? Map<String, Any>)?.let {
          writableArray.pushMap(it.toWritableNativeMap())
        }

      is List<*> ->
        (value as? List<Any>)?.let {
          writableArray.pushArray(it.toWritableNativeArray())
        }
      else -> throw IllegalArgumentException("Unsupported type: ${value::class.simpleName}")
    }
  }

  return writableArray
}

internal inline fun <T> Iterable<T>.toWritableNativeArray(mapper: (item: T) -> WritableNativeMap): WritableNativeArray {
  val arr = WritableNativeArray()

  forEach {
    arr.pushMap(mapper(it))
  }

  return arr
}

internal fun ApphudSubscription.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("status", status.toString().lowercase())
  result.putString("productId", productId)
  result.putDouble("expiresAt", expiresAt.toDouble())
  result.putDouble("startedAt", startedAt.toDouble())

  cancelledAt?.let {
    result.putDouble("canceledAt", it.toDouble())
  }

  result.putString("purchaseToken", purchaseToken)
  result.putBoolean("isInRetryBilling", isInRetryBilling)
  result.putBoolean("isAutoRenewEnabled", isAutoRenewEnabled)

  result.putString("kind", kind.source)
  result.putString("groupId", groupId)

  result.putBoolean("isActive", isActive())

  return result
}

internal fun ApphudProduct.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("productId", productId)
  result.putString("name", name)
  result.putString("store", store)
  result.putString("basePlanId", basePlanId)

  productDetails?.let {
    result.putMap("productDetails", it.toMap())
  }

  result.putString("placementIdentifier", placementIdentifier)
  result.putString("paywallIdentifier", paywallIdentifier)

  return result
}

internal fun ApphudPaywall.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("name", name)
  result.putString("identifier", identifier)
  result.putBoolean("isDefault", default)

  json?.let {
    result.putMap("json", it.toWritableNativeMap())
  }

  result.putArray(
    "products",
    products?.toWritableNativeArray { it.toMap() } ?: WritableNativeArray())

  result.putString("experimentName", experimentName)
  result.putString("variationName", variationName)
  result.putString("parentPaywallIdentifier", parentPaywallIdentifier)
  result.putString("placementIdentifier", placementIdentifier)

  return result
}

internal fun ApphudNonRenewingPurchase.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("productId", productId)
  result.putDouble("purchasedAt", purchasedAt.toDouble())

  canceledAt?.let {
    result.putDouble("canceledAt", it.toDouble())
  }

  result.putString("purchaseToken", purchaseToken)
  result.putBoolean("isConsumable", isConsumable)

  result.putBoolean("isActive", isActive())

  return result
}

internal fun Purchase.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("orderId", orderId)
  result.putInt("purchaseState", purchaseState)
  result.putDouble("purchaseTime", purchaseTime.toDouble())
  result.putString("purchaseToken", purchaseToken)

  return result
}

internal fun ApphudPurchaseResult.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  subscription?.let {
    result.putMap("subscription", it.toMap())
  }

  nonRenewingPurchase?.let {
    result.putMap("nonRenewingPurchase", it.toMap())
  }

  purchase?.let {
    result.putMap("purchase", it.toMap())
  }

  error?.let {
    val errorMap = WritableNativeMap()
    errorMap.putInt("code", it.errorCode ?: 0)
    errorMap.putString("message", it.message)
    result.putMap("error", errorMap)
  }

  result.putBoolean("userCanceled", userCanceled())

  return result

}

internal fun PricingPhase.toMap(): WritableNativeMap {
  val phaseMap = WritableNativeMap()
  val price: Double = priceAmountMicros / 1000000.0
  phaseMap.putDouble("price", price)
  phaseMap.putString("priceCurrencyCode", priceCurrencyCode)
  phaseMap.putInt("billingCycleCount", billingCycleCount)
  phaseMap.putInt("recurrenceMode", recurrenceMode)
  phaseMap.putString("formattedPrice", formattedPrice)

  return phaseMap
}

internal fun SubscriptionOfferDetails.toMap(): WritableNativeMap {
  val offerMap = WritableNativeMap()
  offerMap.putString("offerToken", offerToken)
  offerMap.putString("basePlanId", basePlanId)
  offerMap.putString("offerId", offerId)

  offerMap.putArray(
    "pricingPhases",
    pricingPhases.pricingPhaseList.toWritableNativeArray { it.toMap() }
  )

  return offerMap
}

internal fun OneTimePurchaseOfferDetails.toMap(): WritableNativeMap {
  val offerMap = WritableNativeMap()
  offerMap.putString("priceCurrencyCode", priceCurrencyCode)

  val price: Double = priceAmountMicros / 1000000.0
  offerMap.putDouble("price", price)

  offerMap.putString("formattedPrice", formattedPrice)

  return offerMap
}

internal fun ProductDetails.toMap(): WritableNativeMap {
  val offersMaps =
    subscriptionOfferDetails?.toWritableNativeArray { it.toMap() } ?: WritableNativeArray()

  val item = WritableNativeMap()

  item.putString("id", productId)
  item.putString("productType", productType)
  item.putString("store", "play_store")
  item.putString("title", title)
  item.putString("subscriptionPeriod", subscriptionPeriod())
  item.putArray("subscriptionOffers", offersMaps)
  val details = oneTimePurchaseOfferDetails

  details?.let {
    item.putMap("oneTimePurchaseOffer", it.toMap())
    val price: Double = it.priceAmountMicros / 1000000.0
    item.putDouble("price", price)
  }

  if (subscriptionOfferDetails?.count() == 1) {
    val offerPrice =
      subscriptionOfferDetails?.firstOrNull()?.pricingPhases?.pricingPhaseList?.firstOrNull()?.priceAmountMicros

    offerPrice?.let {
      val price: Double = it / 1000000.0
      item.putDouble("price", price)
    }
  }


  return item
}

internal fun ApphudUser.toMap(): WritableNativeMap {
  val userMap = WritableNativeMap()

  userMap.putString("userId", userId)
  userMap.putArray("subscriptions", subscriptions.toWritableNativeArray { it.toMap() })
  userMap.putArray("purchases", purchases.toWritableNativeArray { it.toMap() })

  return userMap
}

internal fun ApphudPlacement.toMap() = WritableNativeMap().apply {
  putString("identifier", identifier)

  paywall?.let {
    putMap("paywall", it.toMap())
  }

  experimentName?.let {
    putString("experimentName", it)
  }
}
