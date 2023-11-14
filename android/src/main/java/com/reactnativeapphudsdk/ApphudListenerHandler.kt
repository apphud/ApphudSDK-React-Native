package com.reactnativeapphudsdk

import android.util.Log
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.SkuDetails
import com.apphud.sdk.ApphudListener
import com.apphud.sdk.domain.ApphudPaywall
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class ApphudListenerHandler(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ApphudListener {
  override fun apphudDidChangeUserID(userId: String) {
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("apphudDidChangeUserID", userId)
  }

  override fun apphudFetchProductDetails(details: List<ProductDetails>) {
      val map = details.map { detail -> ApphudDataTransformer.getProductMap(detail) }
    val nativeProducts: WritableNativeArray = WritableNativeArray()
    map.forEach {
      nativeProducts.pushMap(it)
    }

    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    .emit("apphudDidLoadStoreProducts", nativeProducts)
  }

  override fun paywallsDidFullyLoad(paywalls: List<ApphudPaywall>) {

    val paywallsMap = paywalls.map { paywall -> ApphudDataTransformer.getApphudPaywallMap(paywall) }
    val nativeArray = WritableNativeArray()
    paywallsMap.forEach {
      nativeArray.pushMap(it)
    }

    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("paywallsDidFullyLoad", nativeArray);
  }

  override fun userDidLoad() {

  }

  override fun getName(): String {
    return "ApphudSdkEvents";
  }
}
