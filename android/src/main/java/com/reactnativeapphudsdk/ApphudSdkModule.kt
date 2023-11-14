package com.reactnativeapphudsdk
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
    HeadersInterceptor.X_SDK_VERSION = "1.3.0"
    listener = ApphudListenerHandler(reactContext)
    listener?.let { Apphud.setListener(it) }
  }

  @ReactMethod
  fun start(options: ReadableMap, promise: Promise) {

    val apiKey = options.getString("apiKey")
    val userId = options.getString("userId")
    val deviceId = options.getString("deviceId")

    if (apiKey.isNullOrEmpty()) {
      promise.reject("Error", "Api Key not set")
      return
    }

    if (BuildConfig.DEBUG) {
        Apphud.enableDebugLogs()
    }

    runOnUiThread {
      Apphud.start(this.reactApplicationContext, apiKey!!, userId, deviceId)
      promise.resolve(true)
    }
  }

  @ReactMethod
  fun startManually(options: ReadableMap, promise: Promise) {
    this.start(options, promise)
  }

  @ReactMethod
  fun hasActiveSubscription(promise: Promise) {
    promise.resolve(
      Apphud.hasActiveSubscription()
    )
  }

  @ReactMethod
  fun paywalls(promise: Promise) {
    Apphud.paywallsDidLoadCallback {
      val result = WritableNativeArray()
      for (paywall in it) {
        result.pushMap(ApphudDataTransformer.getApphudPaywallMap(paywall))
      }
      promise.resolve(result)
    }
  }

  @ReactMethod
  fun willPurchaseFromPaywall(identifier: String, promise: Promise) {
    promise.reject("Error",unSupportMethodMsg)
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
    val paywalls = Apphud.paywalls()

    for (paywall in paywalls) {
      if (product == null) {
        product = paywall.products?.firstOrNull { p ->
          p.product_id == productId && (paywallId.isNullOrEmpty() || p.paywall_identifier == paywallId)
        }
      }
    }

    val isSub = product?.productDetails?.productType?.lowercase() == "subs"
    val offerToken = args.getString("offerToken")
    val isConsumable = args.getBoolean("isConsumable")

    if (product == null) {
      promise.reject("Error", "Product not found")
      return
    }

    if (isSub && offerToken.isNullOrEmpty()) {
      promise.reject("Error", "Offer Token not found")
    } else if (!offerToken.isNullOrEmpty()) {
      purchaseSubscription(product, offerToken, promise)
    } else {
      purchaseOneTimeProduct(product, isConsumable, promise)
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
  fun userId(promise: Promise) {
    promise.resolve(Apphud.userId())
  }

  @ReactMethod
  fun addAttribution(options: ReadableMap, promise: Promise) {
    val data = options.getMap("data")
    val identifier = options.getString("identifier")
    val provider = ApphudAttributionProvider.valueOf(
      options.getString("attributionProviderId").toString()
    )
    Apphud.addAttribution(provider, data?.toHashMap(), identifier)
    promise.resolve(true)
  }

  @ReactMethod
  fun products(promise: Promise) {
    val result = WritableNativeArray()
    val products = Apphud.products()
    if (products != null) {
      for (product in products) {
        result.pushMap(ApphudDataTransformer.getProductMap(product))
      }
    }
    promise.resolve(result)
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
  fun product(productIdentifier: String, promise: Promise) {
    val product = Apphud.product(productIdentifier)
    if (product != null) {
      promise.resolve(ApphudDataTransformer.getProductMap(product))
    } else {
      promise.reject("product", "product not found")
    }
  }

  @ReactMethod
  fun setUserProperty(key: String, value: String, setOnce: Boolean, promise: Promise) {
    val label = getUserPropertyKey(key)
    Apphud.setUserProperty(label, value, setOnce)
    promise.resolve(true)
  }

  @ReactMethod
  fun incrementUserProperty(key: String, by: String, promise: Promise) {
    val label = getUserPropertyKey(key)
    Apphud.incrementUserProperty(label, by)
    promise.resolve(true)
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
    Apphud.restorePurchases { _, _, _ ->
      promise.resolve(true)
    }
  }

  @ReactMethod
  fun optOutOfTracking(promise: Promise) {
    promise.resolve(Apphud.optOutOfTracking())
  }

  @ReactMethod
  fun collectDeviceIdentifiers(promise: Promise) {
    promise.resolve(Apphud.collectDeviceIdentifiers())
  }

  @ReactMethod
  fun logout(promise: Promise) {
    Apphud.logout()
    promise.resolve(true)
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

  @ReactMethod
  fun enableDebugLogs(promise: Promise) {
    Apphud.enableDebugLogs()
    promise.resolve(true)
  }
}
