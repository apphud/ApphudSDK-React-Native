package com.reactnativeapphudsdk

import android.telecom.Call
import android.util.Log
import com.apphud.sdk.APPHUD_DEFAULT_MAX_TIMEOUT
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudPurchasesRestoreResult
import com.apphud.sdk.ApphudUserPropertyKey
import com.apphud.sdk.ApphudUtils
import com.apphud.sdk.domain.ApphudPaywallScreenShowResult
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.internal.data.network.SdkHeaders
//import com.apphud.sdk.managers.HeadersInterceptor
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ApphudSdkModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val unSupportMethodMsg: String = "Unsupported method"

  override fun getName(): String {
    return "ApphudSdk"
  }

  init {
    SdkHeaders.X_SDK = "reactnative"
    val nativeSdkVersion: String = SdkHeaders.X_SDK_VERSION
    if (!nativeSdkVersion.contains("(")) {
      SdkHeaders.X_SDK_VERSION =
        BuildConfig.REACT_NATIVE_APPHUD_SDK_VERSION + "(${nativeSdkVersion})"
    }
  }

  @ReactMethod
  fun start(options: ReadableMap, promise: Promise) {
    startManually(options, promise)
  }

  private fun applyBaseUrl(options: ReadableMap) {
    if (options.hasKey("baseUrl")) {
      val baseUrl = options.getString("baseUrl")
      if (!baseUrl.isNullOrEmpty()) {
        ApphudUtils.overrideBaseUrl(baseUrl)
      }
    }
  }

  @ReactMethod
  fun setHost(url: String) {
    ApphudUtils.overrideBaseUrl(url)
  }

  @ReactMethod
  fun startManually(options: ReadableMap, promise: Promise) {
    val apiKey = options.getString("apiKey")
    Log.d("ApphudSdkModule", "apiKey: $apiKey")
    val userId = options.getString("userId")
    val deviceId = options.getString("deviceId")
    val observerMode = if (options.hasKey("observerMode")) {
      options.getBoolean("observerMode")
    } else {
      false
    }

    if (apiKey.isNullOrEmpty()) {
      promise.reject("Error", "apiKey not set")
      return
    }

    applyBaseUrl(options)
    ApphudUtils.enableAllLogs()

    runOnUiThread {
      Apphud.start(
        this.reactApplicationContext,
        apiKey,
        userId,
        deviceId,
        observerMode
      ) {
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
  fun paywallShown(options: ReadableMap) {
    Utils.paywall(options) { paywall ->
      paywall?.let {
        Apphud.paywallShown(paywall)
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

    Utils.paywall(args) { paywall ->
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
    reactApplicationContext.currentActivity?.let {
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
    reactApplicationContext.currentActivity?.let {
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
    moduleScope.launch {
      try {
        val placements = Apphud.placements()
        val products = placements
          .mapNotNull { it.paywall?.products }
          .flatten()
          .distinctBy { it.productId }
        promise.resolve(products.toWritableNativeArray { it.toMap() })
      } catch (e: Exception) {
        promise.reject("Error", e.message, e)
      }
    }
  }

  @ReactMethod
  fun rawPlacements(promise: Promise) {
    runOnUiThread {
      promise.resolve(Apphud.rawPlacements().toWritableNativeArray { it.toMap() })
    }
  }

  @ReactMethod
  fun placement(identifier: String, options: ReadableMap, promise: Promise) {
    val placementsOptions = options.getPlacementsOptions()
    moduleScope.launch {
      try {
        val placement = if (placementsOptions.forceRefresh) {
          Utils.getPlacement(
            identifier = identifier,
            preferredTimeout = placementsOptions.preferredTimeout,
            forceRefresh = true,
          )
        } else {
          Apphud.placement(identifier)
        }
        promise.resolve(placement?.toMap())
      } catch (e: Exception) {
        promise.reject("Error", e.message, e)
      }
    }
  }

  @ReactMethod
  fun attributeFromDeeplink(promise: Promise) {
    Apphud.attributeFromDeeplink { data ->
      if (data == null) {
        promise.resolve(null)
      } else {
        promise.resolve(data.toWritableNativeMap())
      }
    }
  }

  @ReactMethod
  fun isCommitmentPlanPreferred(options: ReadableMap, promise: Promise) {
    promise.resolve(false)
  }

  @ReactMethod
  fun isCommitmentPlanSupported(options: ReadableMap, promise: Promise) {
    promise.resolve(false)
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
    Apphud.restorePurchases { result ->
      val resultMap = WritableNativeMap()

      when(result) {
        is ApphudPurchasesRestoreResult.Error -> {
          resultMap.putString("error", result.error.message)
        }

        is ApphudPurchasesRestoreResult.Success -> {
          resultMap.putArray("subscriptions", result.subscriptions.toWritableNativeArray { it.toMap() })
          resultMap.putArray("nonRenewingPurchases", result.purchases.toWritableNativeArray { it.toMap() })
        }
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
    Apphud.restorePurchases { result ->
      promise.resolve(result is ApphudPurchasesRestoreResult.Success)
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
  fun placements(options: ReadableMap, promise: Promise) {
    val placementsOptions = options.getPlacementsOptions()

    Apphud.fetchPlacements(preferredTimeout = placementsOptions.preferredTimeout, forceRefresh = placementsOptions.forceRefresh) { placements, error ->
      if (error != null && placements.isEmpty()) {
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
  fun unloadPaywallScreen(options: ReadableMap, promise: Promise) {
    promise.resolve(null)
  }

  @ReactMethod
  fun logout(promise: Promise) {
    Apphud.logout()
    promise.resolve(null)
  }

  @ReactMethod
  fun updateUserID(userID: String, promise: Promise) {
    Apphud.updateUserId(userID) { promise.resolve(it?.toMap()) }
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
