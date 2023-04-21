package com.reactnativeapphudsdk

import com.android.billingclient.api.SkuDetails
import com.apphud.sdk.ApphudListener
import com.apphud.sdk.domain.ApphudPaywall
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.modules.core.DeviceEventManagerModule

class ApphudListenerHandler(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ApphudListener {
  private var isListeningStarted: Boolean = false
  private var paywallsCached: List<ApphudPaywall>? = null

  override fun apphudDidChangeUserID(userId: String) {
    TODO("Not yet implemented")
  }

  override fun apphudFetchSkuDetailsProducts(details: List<SkuDetails>) {
    TODO("Not yet implemented")
  }

  override fun paywallsDidFullyLoad(paywalls: List<ApphudPaywall>) {
    paywallsCached = paywalls;
    if (isListeningStarted) {
      val resultMap = hashMapOf<String, Any?>()
      resultMap["paywalls"] = paywalls.map { paywall -> ApphudDataTransformer.getApphudPaywallMap(paywall) }
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("paywallsDidFullyLoad", resultMap);
    }
  }

  override fun userDidLoad() {
    TODO("Not yet implemented")
  }

  override fun getName(): String {
    return "ApphudSdkEvents";
  }
}
