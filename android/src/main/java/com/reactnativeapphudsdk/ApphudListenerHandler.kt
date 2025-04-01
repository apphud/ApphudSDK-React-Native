package com.reactnativeapphudsdk

import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudListener
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudPlacement
import com.apphud.sdk.domain.ApphudUser
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule

enum class ApphudSdkDelegateEvents(val value: String) {
  PAYWALLS_DID_FULLY_LOAD("paywallsDidFullyLoad"),
  APPHUD_DID_LOAD_STORE_PRODUCTS("apphudDidLoadStoreProducts"),
  APPHUD_DID_CHANGE_USER_ID("apphudDidChangeUserID"),
  APPHUD_SUBSCRIPTIONS_UPDATED("apphudSubscriptionsUpdated"),
  APPHUD_NON_RENEWING_PURCHASES_UPDATED("apphudNonRenewingPurchasesUpdated"),
  APPHUD_PRODUCT_IDENTIFIERS("apphudProductIdentifiers"),
  APPHUD_DID_PURCHASE("apphudDidPurchase"),
  APPHUD_WILL_PURCHASE("apphudWillPurchase"),
  APPHUD_DID_FAIL_PURCHASE("apphudDidFailPurchase"),
  APPHUD_DID_SELECT_SURVEY_ANSWER("apphudDidSelectSurveyAnswer")
}

class ApphudListenerHandler(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ApphudListener {
  init {
    Apphud.setListener(this)
  }

  override fun apphudDidChangeUserID(userId: String) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(ApphudSdkDelegateEvents.APPHUD_DID_CHANGE_USER_ID.value, userId)
  }

  override fun apphudFetchProductDetails(details: List<ProductDetails>) {
    val nativeProducts = details.toWritableNativeArray { it.toMap() }

    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(ApphudSdkDelegateEvents.APPHUD_DID_LOAD_STORE_PRODUCTS.value, nativeProducts)
  }

  override fun paywallsDidFullyLoad(paywalls: List<ApphudPaywall>) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(
        ApphudSdkDelegateEvents.PAYWALLS_DID_FULLY_LOAD.value,
        paywalls.toWritableNativeArray { it.toMap() });
  }

  override fun placementsDidFullyLoad(placements: List<ApphudPlacement>) {
    // do nothing
  }

  override fun userDidLoad(user: ApphudUser) {
    // do nothing
  }

  override fun apphudDidReceivePurchase(purchase: Purchase) {
    // do nothing
  }

  override fun getName(): String {
    return "ApphudSdkEvents"
  }
}
