package com.reactnativeapphudsdk

import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.ProductDetails.OneTimePurchaseOfferDetails
import com.android.billingclient.api.ProductDetails.PricingPhase
import com.android.billingclient.api.ProductDetails.SubscriptionOfferDetails
import com.android.billingclient.api.SkuDetails
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudPurchaseResult
import com.apphud.sdk.domain.ApphudNonRenewingPurchase
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.domain.ApphudSubscription
import com.apphud.sdk.managers.subscriptionPeriod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableNativeArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap

class ApphudDataTransformer {
  companion object {
    fun getSubscriptionMap(subscription: ApphudSubscription): WritableNativeMap {
      val result: WritableNativeMap = WritableNativeMap()
      result.putString("productId", subscription.productId)
      result.putDouble("expiresAt", subscription.expiresAt.toDouble())
      result.putDouble("startedAt", subscription.startedAt!!.toDouble())

      subscription.cancelledAt?.let {
        result.putDouble("canceledAt", it.toDouble())
      }

      result.putBoolean("isInRetryBilling", subscription.isInRetryBilling)
      result.putBoolean("isAutoRenewEnabled", subscription.isAutoRenewEnabled)
      result.putBoolean("isIntroductoryActivated", subscription.isIntroductoryActivated)
      result.putBoolean("isActive", subscription.isActive())
      result.putString("status", subscription.status.toString().lowercase())
      return result
    }

    fun getApphudProductMap(apphudProduct: ApphudProduct): WritableNativeMap {
      val payload = WritableNativeMap()
      payload.putString("name", apphudProduct.name)
      payload.putString("store", apphudProduct.store)
      payload.putString("paywallIdentifier", apphudProduct.paywallIdentifier)
      payload.putString("id", apphudProduct.productId)
      apphudProduct.productDetails?.let {
        payload.merge(getProductMap(it) )
      }

      return payload
    }

    fun getApphudPaywallMap(paywall: ApphudPaywall): WritableNativeMap {
      val result: WritableNativeMap = WritableNativeMap()
      result.putString("identifier", paywall.identifier)
      result.putBoolean("isDefault", paywall.default)
      result.putString("experimentName", paywall.experimentName)
      result.putString("variationName", paywall.variationName)
      result.putString("json",paywall.json.toString())
      val array: WritableNativeArray = WritableNativeArray()
      paywall.products?.map { it
          array.pushMap(getApphudProductMap(it))
      }
      result.putArray("products", array)
      return result
    }

    fun getNonRenewingPurchaseMap(purchase: ApphudNonRenewingPurchase): WritableNativeMap {
      val item: WritableNativeMap = WritableNativeMap()
      item.putString("productId", purchase.productId)
      item.putDouble("purchasedAt", purchase.purchasedAt.toDouble())

      purchase.canceledAt?.let {
        item.putDouble("canceledAt", it.toDouble())
      }
      item.putBoolean("isActive", purchase.isActive())
      return item
    }

    fun getPurchaseMap(result: ApphudPurchaseResult): WritableNativeMap {

      val resultItem: WritableNativeMap = WritableNativeMap()
      val purchase = result.purchase

      if (purchase != null) {
        val item = WritableNativeMap()
        item.putString("orderId", purchase.orderId)
        item.putInt("purchaseState", purchase.purchaseState)
        item.putDouble("purchaseTime", purchase.purchaseTime.toDouble())
        item.putString("purchaseToken", purchase.purchaseToken)
        resultItem.putMap("playStoreTransaction", item)
      }

      resultItem.putBoolean("success", result.error == null)
      resultItem.putBoolean("userCanceled", result.userCanceled())

      result.subscription?.let {
        resultItem.putMap("subscription", getSubscriptionMap(it))
      }

      result.nonRenewingPurchase?.let {
        resultItem.putMap("nonRenewingPurchase", getNonRenewingPurchaseMap(it))
      }

      result.error?.let {
        val errorMap = WritableNativeMap()
        errorMap.putInt("code", it.errorCode ?: 0)
        errorMap.putString("message", it.message)
        resultItem.putMap("error", errorMap)
      }

      return resultItem
    }

    private fun getPricingPhase(phase: PricingPhase): WritableNativeMap {
      val phaseMap = WritableNativeMap()
      val price: Double =  phase.priceAmountMicros / 1000000.0
      phaseMap.putDouble("price", price)
      phaseMap.putString("priceCurrencyCode", phase.priceCurrencyCode)
      phaseMap.putInt("billingCycleCount", phase.billingCycleCount)
      phaseMap.putInt("recurrenceMode", phase.recurrenceMode)
      phaseMap.putString("formattedPrice", phase.formattedPrice)

      return phaseMap
    }

    private fun getOfferMap(offerDetails: SubscriptionOfferDetails): WritableNativeMap {
      val offerMap = WritableNativeMap()
      offerMap.putString("offerToken", offerDetails.offerToken)
      offerMap.putString("basePlanId", offerDetails.basePlanId)
      offerMap.putString("offerId", offerDetails.offerId)

      val phaseNativeArray = WritableNativeArray()
      offerDetails.pricingPhases.pricingPhaseList.forEach {
        val pricingPhaseMap = getPricingPhase(it)
        phaseNativeArray.pushMap(pricingPhaseMap)
      }

      offerMap.putArray("pricingPhases", phaseNativeArray)

      return offerMap
    }

    private fun getOneTimePurchaseOffer(oneTimeOffer: OneTimePurchaseOfferDetails): WritableNativeMap {
      val offerMap = WritableNativeMap()
      offerMap.putString("priceCurrencyCode", oneTimeOffer.priceCurrencyCode)

      val price: Double =  oneTimeOffer.priceAmountMicros / 1000000.0
      offerMap.putDouble("price", price)

      offerMap.putString("formattedPrice", oneTimeOffer.formattedPrice)

      return offerMap
    }

    fun getProductMap(product: ProductDetails): WritableNativeMap {

      val offersMaps = WritableNativeArray()
      val offers = product.subscriptionOfferDetails
      offers?.forEach {
        val offerMap = getOfferMap(it)
        offersMaps.pushMap(offerMap)
      }

      val item = WritableNativeMap()

      item.putString("id", product.productId)
      item.putString("productType", product.productType)
      item.putString("store", "play_store")
      item.putString("title", product.title)
      item.putString("subscriptionPeriodAndroid", product.subscriptionPeriod())
      item.putArray("subscriptionOffers", offersMaps)
      val details = product.oneTimePurchaseOfferDetails
      details?.let {
        item.putMap("oneTimePurchaseOffer", getOneTimePurchaseOffer(it))
        val price: Double =  it.priceAmountMicros / 1000000.0
        item.putDouble("price", price)
      }

      if (offers?.count() == 1) {
          val offerPrice = offers.firstOrNull()?.pricingPhases?.pricingPhaseList?.firstOrNull()?.priceAmountMicros
        offerPrice?.let {
          val price: Double =  it / 1000000.0
          item.putDouble("price", price)
        }
      }


      return item
    }
  }
}
