package com.reactnativeapphudsdk

import android.util.Log
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudUserPropertyKey
import com.apphud.sdk.ApphudUtils
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.managers.HeadersInterceptor
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread

class ApphudSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val unSupportMethodMsg: String = "Unsupported method"

  override fun getName(): String {
    return "ApphudSdk"
  }

  init {
    HeadersInterceptor.X_SDK = "reactnative"
    HeadersInterceptor.X_SDK_VERSION = "2.2.0"
  }

  @ReactMethod
  fun start(options: ReadableMap, promise: Promise) {
    startManually(options, promise)
  }

  @ReactMethod
  fun startManually(options: ReadableMap, promise: Promise) {
    val apiKey = options.getString("apiKey")
    val userId = options.getString("userId")
    val deviceId = options.getString("deviceId")

    if (apiKey.isNullOrEmpty()) {
      promise.reject("Error", "apiKey not set")
      return
    }

    runOnUiThread {
      Apphud.start(this.reactApplicationContext, apiKey, userId, deviceId) {
        promise.resolve(it.toMap())
      }
    }
  }

  @ReactMethod
  fun setDeviceIdentifiers(options: ReadableMap, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun userId(promise: Promise) {
    runOnUiThread {
      promise.resolve(Apphud.userId())
    }
  }


  @ReactMethod
  fun hasActiveSubscription(promise: Promise) {
    promise.resolve(
      Apphud.hasActiveSubscription()
    )
  }

  @ReactMethod
  fun paywalls(promise: Promise) {
    Apphud.paywallsDidLoadCallback { list, error ->
      if (error != null) {
        promise.reject(error)
        return@paywallsDidLoadCallback
      }

      promise.resolve(list.toWritableNativeArray { it.toMap() })
    }
  }

  @ReactMethod
  fun paywallShown(options: ReadableMap) {
    val paywallIdentifier = options.getString("paywallIdentifier")
    val placementIdentifier = options.getString("placementIdentifier")

    Utils.paywall(paywallIdentifier, placementIdentifier) { paywall ->
      paywall?.let {
        Apphud.paywallShown(paywall)
      }
    }
  }

  @ReactMethod
  fun paywallClosed(options: ReadableMap) {
    val paywallIdentifier = options.getString("paywallIdentifier")
    val placementIdentifier = options.getString("placementIdentifier")

    Utils.paywall(paywallIdentifier, placementIdentifier) { paywall ->
      paywall?.let {
        Apphud.paywallClosed(paywall)
      }
    }

  }

  @ReactMethod
  fun purchase(args: ReadableMap, promise: Promise) {
    val productId = args.getString("productId")

    if (productId.isNullOrEmpty()) {
      promise.reject("Error", "ProductId not set")
      return
    }


    val placementId = args.getString("placementIdentifier")
    val paywallId = args.getString("paywallIdentifier")

    Utils.paywall(paywallId, placementId) { paywall ->
      val product = paywall?.products?.find { it.productId == productId }

      val isSub = product?.productDetails?.productType?.lowercase() == "subs"
      val isConsumable = if (args.hasKey("isConsumable")) args.getBoolean("isConsumable") else false

      if (product == null) {
        promise.reject("Error", "Product not found")
        return@paywall
      }

      val offerToken = args.getString("offerToken")

      if (isSub || product.productDetails == null) {
        purchaseSubscription(product, offerToken, promise)
      } else {
        purchaseOneTimeProduct(product, isConsumable, promise)
      }
    }
  }

  private fun purchaseSubscription(product: ApphudProduct, offerToken: String?, promise: Promise) {
    this.currentActivity?.let {
      Apphud.purchase(it, product, offerToken) { res ->
        promise.resolve(res.toMap())
      }
    } ?: run {
      promise.reject("Error", "Activity not found")
    }
  }

  private fun purchaseOneTimeProduct(
    product: ApphudProduct,
    isConsumable: Boolean,
    promise: Promise
  ) {
    this.currentActivity?.let {
      Apphud.purchase(it, product, null, null, null, isConsumable) { res ->
        promise.resolve(res.toMap())
      }
    } ?: run {
      promise.reject("Error", "Activity not found")
    }
  }

  @ReactMethod
  fun setAttribution(options: ReadableMap, promise: Promise) {
    val attributionParams = options.getAttributionParams() ?: run {
      promise.reject("Error", "Options not valid")
      return
    }

    Apphud.setAttribution(
      data = attributionParams.data,
      identifier = attributionParams.identifier,
      provider = attributionParams.provider
    )

//    TODO: узнать почему отличается от ios
    promise.resolve(true)
  }

  @ReactMethod
  fun attributeFromWeb(options: ReadableMap, promise: Promise) {
    val data = options.toHashMap().let {
      val result = mutableMapOf<String, Any>()

      for ((key, value) in it) {
        value?.let { x ->
          result[key] = x
        }
      }

      return@let result
    }

    Apphud.attributeFromWeb(data) { success, user ->
      val result = WritableNativeMap()

      user?.userId?.let {
        result.putString("userId", it)
      }
      result.putBoolean("isPremium", Apphud.hasPremiumAccess())
      result.putBoolean("result", success)

      promise.resolve(result)
    }
  }

  private fun stringToApphudAttributionProvider(value: String): ApphudAttributionProvider? {
    return enumValues<ApphudAttributionProvider>().find {
      it.name == value
    }
  }

  @ReactMethod
  fun products(promise: Promise) {
    Apphud.paywallsDidLoadCallback { apphudPaywalls, apphudError ->
      if (apphudError != null) {
        promise.reject(apphudError)
        return@paywallsDidLoadCallback
      }

      val products = apphudPaywalls.map { it.products ?: listOf() }.flatten()
      promise.resolve(products.toWritableNativeArray { it.toMap() })
    }
  }

  @ReactMethod
  fun subscription(promise: Promise) {
    Apphud.subscription()?.let {
      promise.resolve(it.toMap())
    } ?: run {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun subscriptions(promise: Promise) {
    promise.resolve(Apphud.subscriptions().toWritableNativeArray { it.toMap() })
  }

  @ReactMethod
  fun nonRenewingPurchases(promise: Promise) {
    promise.resolve(Apphud.nonRenewingPurchases().toWritableNativeArray { it.toMap() })
  }

  @ReactMethod
  fun isNonRenewingPurchaseActive(productIdentifier: String, promise: Promise) {
    promise.resolve(
      Apphud.isNonRenewingPurchaseActive(productIdentifier)
    )
  }

  @ReactMethod
  fun setUserProperty(args: ReadableMap) {
    val hash = args.toHashMap()
    val key = hash["key"] as? String
    val value = hash["value"]
    val setOnce = hash["setOnce"] as? Boolean

    if (!key.isNullOrBlank() && setOnce != null) {
      val label = getUserPropertyKey(key)
      Apphud.setUserProperty(label, value, setOnce)
    }
  }

  @ReactMethod
  fun incrementUserProperty(args: ReadableMap) {
    val hash = args.toHashMap()
    val key = hash["key"] as? String
    val value = hash["by"]

    if (!key.isNullOrBlank() && value != null) {
      val label = getUserPropertyKey(key)
      Apphud.incrementUserProperty(label, value)
    }
  }

  @ReactMethod
  fun restorePurchases(promise: Promise) {
    Apphud.restorePurchases { apphudSubscriptionList, apphudNonRenewingPurchaseList, error ->
      val resultMap = WritableNativeMap()
      apphudSubscriptionList.let {
        val arr = WritableNativeArray()
        it?.map { obj -> arr.pushMap(obj.toMap()) }
        resultMap.putArray("subscriptions", arr)
      }
      apphudNonRenewingPurchaseList.let {
        val arr = WritableNativeArray()
        it?.map { obj -> arr.pushMap(obj.toMap()) }
        resultMap.putArray("nonRenewingPurchases", arr)
      }
      error.let {
        resultMap.putString("error", it?.message)
      }
      promise.resolve(resultMap)
    }
  }

  @ReactMethod
  fun hasPremiumAccess(promise: Promise) {
    promise.resolve(Apphud.hasPremiumAccess())
  }

  @ReactMethod
  fun syncPurchasesInObserverMode(promise: Promise) {
    Apphud.restorePurchases { _, _, error ->
      promise.resolve(error == null)
    }
  }

  @ReactMethod
  fun optOutOfTracking() {
    Apphud.optOutOfTracking()
  }

  @ReactMethod
  fun collectDeviceIdentifiers() {
    Apphud.collectDeviceIdentifiers()
  }

  @ReactMethod
  fun setAdvertisingIdentifiers(options: ReadableMap) {
    Apphud.collectDeviceIdentifiers()
  }

  @ReactMethod
  fun enableDebugLogs() {
    ApphudUtils.enableAllLogs()
  }

  @ReactMethod
  fun submitPushNotificationsToken(token: String) {
    // do nothing
  }

  @ReactMethod
  fun handlePushNotification(apsInfo: ReadableMap) {
    // do nothing
  }

  @ReactMethod
  fun placements(promise: Promise) {
    Apphud.fetchPlacements { placements, error ->
      if (error != null) {
        promise.reject("Error", error.localizedMessage)
        return@fetchPlacements
      }

      promise.resolve(placements.toWritableNativeArray { it.toMap() })
    }
  }

  @ReactMethod
  fun idfv(promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun logout(promise: Promise) {
    Apphud.logout()
    promise.resolve(null)
  }

  private fun getUserPropertyKey(key: String): ApphudUserPropertyKey {
    return when (key) {
      "age" -> ApphudUserPropertyKey.Age
      "email" -> ApphudUserPropertyKey.Email
      "name" -> ApphudUserPropertyKey.Name
      "cohort" -> ApphudUserPropertyKey.Cohort
      "gender" -> ApphudUserPropertyKey.Gender
      "phone" -> ApphudUserPropertyKey.Phone
      else -> ApphudUserPropertyKey.CustomProperty(key)
    }
  }
}
