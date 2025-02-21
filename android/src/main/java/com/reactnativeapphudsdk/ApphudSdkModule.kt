package com.reactnativeapphudsdk
import android.util.Log
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudUserPropertyKey
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.managers.HeadersInterceptor
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread

class ApphudSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val unSupportMethodMsg:String = "Unsupported method"

  private var listener: ApphudListenerHandler? = null

  override fun getName(): String {
    return "ApphudSdk"
  }

  init {
    HeadersInterceptor.X_SDK = "reactnative"
    HeadersInterceptor.X_SDK_VERSION = "2.1.0"
    listener = ApphudListenerHandler(reactContext)
    listener?.let { Apphud.setListener(it) }
  }

  @ReactMethod
  fun start(options: ReadableMap) {
      startManually(options)
  }

  @ReactMethod
  fun startManually(options: ReadableMap) {
    val apiKey = options.getString("apiKey")
    val userId = options.getString("userId")
    val deviceId = options.getString("deviceId")

    if (apiKey.isNullOrEmpty()) {
      return
    }

    runOnUiThread {
      Apphud.start(this.reactApplicationContext, apiKey!!, userId, deviceId)
    }
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

      val result = WritableNativeArray()
      for (paywall in list) {
        result.pushMap(ApphudDataTransformer.getApphudPaywallMap(paywall))
      }
      promise.resolve(result)
    }
  }

  @ReactMethod
  fun paywallShown(identifier: String) {
    Apphud.paywallsDidLoadCallback { apphudPaywalls, _ ->
      val paywall = apphudPaywalls.firstOrNull { it.identifier == identifier }

      paywall?.let {
        Apphud.paywallShown(it)
      }
    }
  }

  @ReactMethod
  fun paywallClosed(identifier: String) {
    Apphud.paywallsDidLoadCallback { apphudPaywalls, _ ->
      val paywall = apphudPaywalls.firstOrNull { it.identifier == identifier }

      paywall?.let {
        Apphud.paywallClosed(it)
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

    val paywallId = args.getString("paywallId")

    var product: ApphudProduct? = null

    Apphud.paywallsDidLoadCallback { paywalls, apphudError ->
      if (apphudError != null) {
        promise.reject(apphudError)

        return@paywallsDidLoadCallback
      }

      for (paywall in paywalls) {
        if (product == null) {
          product = paywall.products?.firstOrNull { p ->
            p.productId == productId && (paywallId.isNullOrEmpty() || p.paywallIdentifier == paywallId)
          }
        }
      }

      val isSub = product?.productDetails?.productType?.lowercase() == "subs"
      val offerToken = args.getString("offerToken")
      val isConsumable = if (args.hasKey("isConsumable")) args.getBoolean("isConsumable") else false

      if (product == null) {
        promise.reject("Error", "Product not found")
        return@paywallsDidLoadCallback
      }

      if (isSub && offerToken.isNullOrEmpty()) {
        promise.reject("Error", "Offer Token not found")
      } else if (!offerToken.isNullOrEmpty()) {
        purchaseSubscription(product!!, offerToken, promise)
      } else {
        purchaseOneTimeProduct(product!!, isConsumable, promise)
      }
    }
  }

  private fun purchaseSubscription(product: ApphudProduct, offerToken: String, promise: Promise) {
    this.currentActivity?.let {
      Apphud.purchase(it, product, offerToken) { res ->
        promise.resolve(ApphudDataTransformer.getPurchaseMap(res))
      }
    } ?: run {
      promise.reject("Error", "Activity not found")
    }
  }

  private fun purchaseOneTimeProduct(product: ApphudProduct, isConsumable: Boolean, promise: Promise) {
    this.currentActivity?.let {
      Apphud.purchase(it, product, null, null, null, isConsumable) { res ->
        promise.resolve(ApphudDataTransformer.getPurchaseMap(res))
      }
    } ?: run {
      promise.reject("Error", "Activity not found")
    }
  }

  @ReactMethod
  fun addAttribution(options: ReadableMap) {
    val data = options.getMap("data")?.toHashMap()?.let {
      val result = mutableMapOf<String, Any>()

      for ((key, value) in it) {
        value?.let {
          result[key] = it
        }
      }

      return@let result
    }

    val identifier = options.getString("identifier")
    val providerString = options.getString("attributionProviderId") ?: "none"

    val provider = stringToApphudAttributionProvider(providerString)
    provider?.let {
      Apphud.addAttribution(it, data, identifier)
    } ?: run {
      Log.d("AP", "Unsupported attribution provider ${providerString}, skipping")
    }
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
        result.putString("user_id", it)
      }
      result.putBoolean("is_premium", Apphud.hasPremiumAccess())
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
    Apphud.productsFetchCallback {
      val result = WritableNativeArray()
      for (product in it) {
        result.pushMap(ApphudDataTransformer.getProductMap(product))
      }
      promise.resolve(result)
    }
  }

  @ReactMethod
  fun subscription(promise: Promise) {
    Apphud.subscription()?.let {
      promise.resolve(ApphudDataTransformer.getSubscriptionMap(it))
    } ?: run {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun subscriptions(promise: Promise) {
    val result = WritableNativeArray()
    Apphud.subscriptions().forEach {
      result.pushMap(ApphudDataTransformer.getSubscriptionMap(it))
    }
    promise.resolve(result)
  }

  @ReactMethod
  fun nonRenewingPurchases(promise: Promise) {
    val result: WritableNativeArray = WritableNativeArray()
    for (purchase in Apphud.nonRenewingPurchases()) {
      result.pushMap(ApphudDataTransformer.getNonRenewingPurchaseMap(purchase))
    }
    promise.resolve(result)
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
        val arr: WritableNativeArray = WritableNativeArray()
        it?.map { obj -> arr.pushMap(ApphudDataTransformer.getSubscriptionMap(obj)) }
        resultMap.putArray("subscriptions", arr)
      }
      apphudNonRenewingPurchaseList.let {
        val arr: WritableNativeArray = WritableNativeArray()
        it?.map { obj -> arr.pushMap(ApphudDataTransformer.getNonRenewingPurchaseMap(obj)) }
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
  fun setAdvertisingIdentifier(idfa: String) {
    Apphud.collectDeviceIdentifiers()
  }


  @ReactMethod
  fun enableDebugLogs() {
    Apphud.enableDebugLogs()
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
  fun logout() {
    Apphud.logout()
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
