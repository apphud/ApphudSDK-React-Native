package com.reactnativeapphudsdk
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudUserPropertyKey
import com.apphud.sdk.managers.HeadersInterceptor
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter


class ApphudSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val unSupportMethodMsg:String = "Unsupported method";

    override fun getName(): String {
        return "ApphudSdk"
    }

    init {
      HeadersInterceptor.X_SDK = "reactnative";
      HeadersInterceptor.X_SDK_VERSION = "1.0.7";
      Apphud.productsFetchCallback {
        var arr: WritableNativeArray = WritableNativeArray();
        it.map { s -> arr.pushMap(ApphudDataTransformer.getProductMap(s)) }
        reactContext
          .getJSModule(RCTDeviceEventEmitter::class.java)
          .emit("productFetchCallback", arr);
      }
    }

    @ReactMethod
    fun start(options: ReadableMap, promise: Promise) {

      val apiKey = options.getString("apiKey");
      val userId = options.getString("userId");
      val deviceId = options.getString("deviceId");

      if (apiKey !== null) {
        if (BuildConfig.DEBUG) {
          Apphud.enableDebugLogs();
        };
        if (userId !== null && deviceId !== null) {
          Apphud.start(this.reactApplicationContext, apiKey, userId, deviceId);
        }else if (userId !== null) {
          Apphud.start(this.reactApplicationContext, apiKey, userId);
        }else {
          Apphud.start(this.reactApplicationContext, apiKey);
        }
      }

      promise.resolve(true);
    }

    @ReactMethod
    fun startManually(options: ReadableMap, promise: Promise) {
      this.start(options, promise);
    }

    @ReactMethod
    fun logout(promise: Promise) {
      Apphud.logout();
      promise.resolve(true);
    }

    @ReactMethod
    fun hasActiveSubscription(promise: Promise) {
      promise.resolve(
        Apphud.hasActiveSubscription()
      )
    }

    @ReactMethod
    fun subscriptions(promise: Promise) {
      val subscriptions = Apphud.subscriptions();
      val result: WritableNativeArray = WritableNativeArray();
      for (subscription in subscriptions) {
        result.pushMap(ApphudDataTransformer.getSubscriptionMap(subscription));
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun purchase(productIdentifier: String, promise: Promise) {
      this.currentActivity?.let {
        try {
          Apphud.purchase(it, productIdentifier) { res ->
            val result: WritableNativeArray = WritableNativeArray();
            result.pushMap(ApphudDataTransformer.getPurchaseMap(res));
            promise.resolve(result);
          }
        } catch (error: Error) {
          promise.reject(this.name, error.message);
        }
      };
    }

    @ReactMethod
    fun syncPurchases(promise: Promise) {
      Apphud.syncPurchases();
      promise.resolve(true);
    }

    @ReactMethod
    fun enableDebugLogs(promise: Promise) {
      Apphud.enableDebugLogs();
      promise.resolve(true);
    }

    @ReactMethod
    fun userId(promise: Promise) {
      promise.resolve(Apphud.userId())
    }

    @ReactMethod
    fun addAttribution(options: ReadableMap, promise: Promise) {
      val data = options.getMap("data");
      val identifier = options.getString("identifier");
      val provider = ApphudAttributionProvider.valueOf(
        options.getString("attributionProviderId").toString()
      );
      Apphud.addAttribution(provider, data?.toHashMap(), identifier);
      promise.resolve(true);
    }

    @ReactMethod
    fun products(promise: Promise) {
      val result = WritableNativeArray();
      val products = Apphud.products();
      if (products != null) {
        for (product in products) {
          result.pushMap(ApphudDataTransformer.getProductMap(product));
        }
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun subscription(promise: Promise) {
      val subscription = Apphud.subscription();
      val result: WritableNativeMap = WritableNativeMap();
      if (subscription !== null) {
        result.merge(ApphudDataTransformer.getSubscriptionMap(subscription));
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun nonRenewingPurchases(promise: Promise) {
      val result: WritableNativeArray = WritableNativeArray();
      for (purchase in Apphud.nonRenewingPurchases()) {
        result.pushMap(ApphudDataTransformer.getNonRenewingPurchaseMap(purchase));
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun product(productIdentifier: String, promise: Promise) {
      val product = Apphud.product(productIdentifier);
      if (product != null) {
        promise.resolve(ApphudDataTransformer.getProductMap(product));
      } else {
        promise.reject("product", "product not found");
      }
    }

    @ReactMethod
    fun isNonRenewingPurchaseActive(productIdentifier: String, promise: Promise) {
      promise.resolve(
        Apphud.isNonRenewingPurchaseActive(productIdentifier)
      );
    }

    @ReactMethod
    fun setUserProperty(key: String, value: String, setOnce: Boolean, promise: Promise) {
      val label = getUserPropertyKey(key);
      Apphud.setUserProperty(label, value, setOnce);
      promise.resolve(true);
    }

    @ReactMethod
    fun incrementUserProperty(key: String, by: String, promise: Promise) {
      val label = getUserPropertyKey(key);
      Apphud.incrementUserProperty(label, by)
      promise.resolve(true);
    }

    @ReactMethod
    fun restorePurchases(promise: Promise) {
      Apphud.restorePurchases { apphudSubscriptionList, apphudNonRenewingPurchaseList, error ->
        val resultMap: WritableNativeMap = WritableNativeMap();
        apphudSubscriptionList.let {
          val arr: WritableNativeArray = WritableNativeArray();
          it?.map { obj -> arr.pushMap(ApphudDataTransformer.getSubscriptionMap(obj)) }
          resultMap.putArray("subscriptions", arr);
        }
        apphudNonRenewingPurchaseList.let {
          val arr: WritableNativeArray = WritableNativeArray();
          it?.map { obj -> arr.pushMap(ApphudDataTransformer.getNonRenewingPurchaseMap(obj)) }
          resultMap.putArray("nonRenewingPurchases", arr);
        }
        error.let {
          resultMap.putString("error", it?.message)
        }
        promise.resolve(resultMap);
      }
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
