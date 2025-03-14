package com.reactnativeapphudsdk

import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.ProductDetails.OneTimePurchaseOfferDetails
import com.android.billingclient.api.ProductDetails.PricingPhase
import com.android.billingclient.api.ProductDetails.SubscriptionOfferDetails
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

internal inline fun <T> Iterable<T>.toWritableNativeArray(mapper: (item: T) -> WritableNativeMap): WritableNativeArray {
  val arr = WritableNativeArray()

  forEach {
    arr.pushMap(mapper(it))
  }

  return arr
}

internal fun ApphudSubscription.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("productId", productId)
  result.putDouble("expiresAt", expiresAt.toDouble())
  result.putDouble("startedAt", startedAt.toDouble())

  cancelledAt?.let {
    result.putDouble("canceledAt", it.toDouble())
  }

  result.putBoolean("isInRetryBilling", isInRetryBilling)
  result.putBoolean("isAutoRenewEnabled", isAutoRenewEnabled)
  result.putBoolean("isIntroductoryActivated", isIntroductoryActivated)
  result.putBoolean("isActive", isActive())
  result.putString("status", status.toString().lowercase())

  return result
}

internal fun ApphudProduct.toMap(): WritableNativeMap {
  val payload = WritableNativeMap()
  payload.putString("name", name)
  payload.putString("store", store)
  payload.putString("paywallIdentifier", paywallIdentifier)
  payload.putString("id", productId)

  productDetails?.let {
    payload.merge(it.toMap())
  }

  return payload
}

internal fun ApphudPaywall.toMap(): WritableNativeMap {
  val result = WritableNativeMap()

  result.putString("identifier", identifier)
  result.putBoolean("isDefault", default)
  result.putString("experimentName", experimentName)
  result.putString("variationName", variationName)
  result.putString("json", json.toString())

  result.putArray(
    "products",
    products?.toWritableNativeArray { it.toMap() } ?: WritableNativeArray())

  return result
}

internal fun ApphudNonRenewingPurchase.toMap(): WritableNativeMap {
  val item = WritableNativeMap()
  item.putString("productId", productId)
  item.putDouble("purchasedAt", purchasedAt.toDouble())

  canceledAt?.let {
    item.putDouble("canceledAt", it.toDouble())
  }

  item.putBoolean("isActive", isActive())
  return item
}

internal fun ApphudPurchaseResult.toMap(): WritableNativeMap {
  val resultItem = WritableNativeMap()
  val purchase = purchase

  if (purchase != null) {
    val item = WritableNativeMap()
    item.putString("orderId", purchase.orderId)
    item.putInt("purchaseState", purchase.purchaseState)
    item.putDouble("purchaseTime", purchase.purchaseTime.toDouble())
    item.putString("purchaseToken", purchase.purchaseToken)
    resultItem.putMap("playStoreTransaction", item)
  }

  resultItem.putBoolean("success", error == null)
  resultItem.putBoolean("userCanceled", userCanceled())

  subscription?.let {
    resultItem.putMap("subscription", it.toMap())
  }

  nonRenewingPurchase?.let {
    resultItem.putMap("nonRenewingPurchase", it.toMap())
  }

  error?.let {
    val errorMap = WritableNativeMap()
    errorMap.putInt("code", it.errorCode ?: 0)
    errorMap.putString("message", it.message)
    resultItem.putMap("error", errorMap)
  }

  return resultItem

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
  item.putString("subscriptionPeriodAndroid", subscriptionPeriod())
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
