package com.reactnativeapphudsdk

import android.net.Uri
import android.util.Log
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudPurchasesRestoreResult
import com.apphud.sdk.ApphudUserPropertyKey
import com.apphud.sdk.ApphudUtils
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.internal.data.network.SdkHeaders
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ApphudSdkModule(reactContext: ReactApplicationContext) :
  NativeApphudSdkSpec(reactContext) {

  private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val ruleCallbackHandler = ApphudRuleCallbackHandler(reactContext)

  init {
    SdkHeaders.X_SDK = "reactnative"
    val nativeSdkVersion: String = SdkHeaders.X_SDK_VERSION
    if (!nativeSdkVersion.contains("(")) {
      SdkHeaders.X_SDK_VERSION =
        BuildConfig.REACT_NATIVE_APPHUD_SDK_VERSION + "(${nativeSdkVersion})"
    }
  }

    override fun start(options: ReadableMap, promise: Promise) {
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

    override fun setHost(url: String) {
    ApphudUtils.overrideBaseUrl(url)
  }

    override fun startManually(options: ReadableMap, promise: Promise) {
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
      // React Activity/JS can remount while the process-scoped native SDK is
      // still initialized (e.g. returning from Play Store after a Rule). A
      // second Apphud.start() aborts without invoking the callback, so return
      // the existing user instead of hanging the JS promise forever.
      if (resolveAlreadyInitializedUser(promise)) {
        return@runOnUiThread
      }

      Apphud.start(
        context = this.reactApplicationContext,
        apiKey = apiKey,
        userId = userId,
        deviceId = deviceId,
        observerMode = observerMode,
        ruleCallback = ruleCallbackHandler,
      ) {
        promise.resolve(it.toMap())
      }
    }
  }

  /**
   * Returns true if the native SDK is already initialized and [promise] was
   * completed with the current user (or rejected if the user is unavailable).
   */
  private fun resolveAlreadyInitializedUser(promise: Promise): Boolean {
    Apphud.currentUser()?.let { user ->
      promise.resolve(user.toMap())
      return true
    }
    // userId() is non-null only after ServiceLocator is up (post-start).
    if (Apphud.userId() == null) {
      return false
    }
    Apphud.refreshUserData { user ->
      if (user != null) {
        promise.resolve(user.toMap())
      } else {
        promise.reject(
          "already_initialized",
          "Apphud SDK already initialized but current user is unavailable",
        )
      }
    }
    return true
  }

    /** iOS-only (IDFA / IDFV). Kept as a no-op so the spec is satisfied. */
  override fun setDeviceIdentifiers(options: ReadableMap) {
    // no-op on Android
  }

    override fun userId(promise: Promise) {
    runOnUiThread {
      promise.resolve(Apphud.userId())
    }
  }


    override fun hasActiveSubscription(promise: Promise) {
    promise.resolve(
      Apphud.hasActiveSubscription()
    )
  }

    override fun paywallShown(options: ReadableMap) {
    Utils.paywall(options) { paywall ->
      paywall?.let {
        Apphud.paywallShown(it)
      }
    }
  }

    override fun purchase(args: ReadableMap, promise: Promise) {
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

  /** Promotional offers are an App Store feature; Android never qualifies. */
  override fun checkEligibilityForPromotionalOffer(props: ReadableMap, promise: Promise) {
    promise.resolve(false)
  }

  override fun purchasePromo(props: ReadableMap, promise: Promise) {
    promise.reject("unsupported", "purchasePromo is only available on iOS")
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

    override fun setAttribution(options: ReadableMap, promise: Promise) {
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

    override fun attributeFromWeb(options: ReadableMap, promise: Promise) {
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

    override fun products(promise: Promise) {
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

    override fun rawPlacements(promise: Promise) {
    runOnUiThread {
      promise.resolve(Apphud.rawPlacements().toWritableNativeArray { it.toMap() })
    }
  }

    override fun placement(identifier: String, options: ReadableMap, promise: Promise) {
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

    override fun handleDeeplinkUrl(url: String) {
    if (url.isEmpty()) {
      return
    }

    Apphud.handleUri(Uri.parse(url))
  }

    override fun requestDeferredDeeplinkAttribution(promise: Promise) {
    val activity = reactApplicationContext.currentActivity ?: run {
      promise.reject(
        "no_activity",
        "Deferred deep link attribution requires an attached Activity. " +
          "Call requestDeferredDeeplinkAttribution() while the app is in the foreground."
      )
      return
    }

    runOnUiThread {
      Apphud.requestDeferredDeeplinkAttribution(activity)
      promise.resolve(null)
    }
  }

    override fun isCommitmentPlanPreferred(options: ReadableMap, promise: Promise) {
    promise.resolve(false)
  }

    override fun isCommitmentPlanSupported(options: ReadableMap, promise: Promise) {
    promise.resolve(false)
  }

    override fun subscription(promise: Promise) {
    Apphud.subscription()?.let {
      promise.resolve(it.toMap())
    } ?: run {
      promise.resolve(null)
    }
  }

    override fun subscriptions(promise: Promise) {
    promise.resolve(Apphud.subscriptions().toWritableNativeArray { it.toMap() })
  }

    override fun nonRenewingPurchases(promise: Promise) {
    promise.resolve(Apphud.nonRenewingPurchases().toWritableNativeArray { it.toMap() })
  }

    override fun isNonRenewingPurchaseActive(productIdentifier: String, promise: Promise) {
    promise.resolve(
      Apphud.isNonRenewingPurchaseActive(productIdentifier)
    )
  }

    override fun setUserProperty(args: ReadableMap) {
    val hash = args.toHashMap()
    val key = hash["key"] as? String
    val value = hash["value"]
    val setOnce = hash["setOnce"] as? Boolean

    if (!key.isNullOrBlank() && setOnce != null) {
      val label = getUserPropertyKey(key)
      Apphud.setUserProperty(label, value, setOnce)
    }
  }

    override fun incrementUserProperty(args: ReadableMap) {
    val hash = args.toHashMap()
    val key = hash["key"] as? String
    val value = hash["by"]

    if (!key.isNullOrBlank() && value != null) {
      val label = getUserPropertyKey(key)
      Apphud.incrementUserProperty(label, value)
    }
  }

    override fun restorePurchases(promise: Promise) {
    Apphud.restorePurchases { result ->
      val resultMap = WritableNativeMap()

      when(result) {
        is ApphudPurchasesRestoreResult.Error -> {
          resultMap.putString("error", result.error.message)
        }

        is ApphudPurchasesRestoreResult.Success -> {
          resultMap.putArray("subscriptions", result.subscriptions.toWritableNativeArray { it.toMap() })
          resultMap.putArray("purchases", result.purchases.toWritableNativeArray { it.toMap() })
        }
      }

      promise.resolve(resultMap)
    }
  }

    override fun hasPremiumAccess(promise: Promise) {
    promise.resolve(Apphud.hasPremiumAccess())
  }

    override fun syncPurchasesInObserverMode(promise: Promise) {
    Apphud.restorePurchases { result ->
      promise.resolve(result is ApphudPurchasesRestoreResult.Success)
    }
  }

    override fun optOutOfTracking() {
    Apphud.optOutOfTracking()
  }

    override fun collectDeviceIdentifiers() {
    Apphud.collectDeviceIdentifiers()
  }

  override fun enableDebugLogs() {
    ApphudUtils.enableAllLogs()
  }

    override fun checkRules(promise: Promise) {
    runOnUiThread {
      Apphud.checkRules()
      promise.resolve(null)
    }
  }

    override fun pendingRule(promise: Promise) {
    runOnUiThread {
      promise.resolve(Apphud.pendingRule()?.toMap())
    }
  }

    override fun showPendingRuleScreen(promise: Promise) {
    runOnUiThread {
      Apphud.showPendingScreen { shown ->
        promise.resolve(shown)
      }
    }
  }

    override fun submitPushNotificationsToken(token: String, promise: Promise) {
    Apphud.submitPushNotificationsToken(token) { success ->
      promise.resolve(success)
    }
  }

    override fun handlePushNotification(apsInfo: ReadableMap, promise: Promise) {
    runOnUiThread {
      val data = mutableMapOf<String, Any>()
      for ((key, value) in apsInfo.toHashMap()) {
        if (value != null) {
          data[key] = value
        }
      }
      promise.resolve(Apphud.handlePushNotification(data))
    }
  }

    override fun placements(options: ReadableMap, promise: Promise) {
    val placementsOptions = options.getPlacementsOptions()

    Apphud.fetchPlacements(preferredTimeout = placementsOptions.preferredTimeout, forceRefresh = placementsOptions.forceRefresh) { placements, error ->
      if (error != null && placements.isEmpty()) {
        promise.reject("Error", error.localizedMessage)
        return@fetchPlacements
      }

      promise.resolve(placements.toWritableNativeArray { it.toMap() })
    }
  }

    override fun idfv(promise: Promise) {
    promise.resolve(null)
  }

    /** Paywall screens are not preloaded on Android; kept for spec parity. */
  override fun preloadPaywallScreens(placementIdentifiers: ReadableArray) {
    // no-op on Android
  }

  override fun unloadPaywallScreen(options: ReadableMap, promise: Promise) {
    promise.resolve(null)
  }

    override fun logout(promise: Promise) {
    Apphud.logout()
    promise.resolve(null)
  }

    override fun updateUserID(userID: String, promise: Promise) {
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

  companion object {
    const val NAME = NativeApphudSdkSpec.NAME
  }
}
