package com.reactnativeapphudsdk
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudAttributionProvider
import com.apphud.sdk.ApphudUserPropertyKey
import com.facebook.react.bridge.*
import java.lang.Error

class ApphudSdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val unSupportMethodMsg:String = "Unsupported method";

    override fun getName(): String {
        return "ApphudSdk"
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
        val item: WritableNativeMap = WritableNativeMap();
        item.putString("status", subscription.status.toString());
        item.putString("productId", subscription.productId);
        item.putString("expiresAt", subscription.expiresAt.toString());
        item.putString("startedAt", subscription.startedAt.toString());
        item.putString("cancelledAt", subscription.cancelledAt.toString());
        item.putBoolean("isAutoRenewEnabled", subscription.isAutoRenewEnabled);
        item.putBoolean("isInRetryBilling", subscription.isInRetryBilling);
        item.putBoolean("isIntroductoryActivated", subscription.isIntroductoryActivated);
        item.putBoolean("isActive", subscription.isActive());
        item.putString("kind", subscription.kind.toString());
        result.pushMap(item)
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun purchase(productIdentifier: String, promise: Promise) {
      this.currentActivity?.let {
        try {
          Apphud.purchase(it, productIdentifier ) { res ->
            val result: WritableNativeArray = WritableNativeArray();
            for (purchase in res) {
              val item: WritableNativeMap = WritableNativeMap();
              item.putString("orderId", purchase.orderId);
              item.putString("originalJson", purchase.originalJson);
              item.putString("packageName", purchase.packageName);
              item.putInt("purchaseState", purchase.purchaseState);
              item.putInt("purchaseTime", purchase.purchaseTime.toInt());
              item.putString("purchaseToken", purchase.purchaseToken);
              item.putString("signature", purchase.signature);
              item.putString("sku", purchase.sku);
              result.pushMap(item);
            }
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
          val item = WritableNativeMap();
          item.putString("id", product.sku);
          item.putString("price", product.price);
          item.putString("currencyCode", product.priceCurrencyCode);
          result.pushMap(item);
        }
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun subscription(promise: Promise) {
      val subscription = Apphud.subscription();
      val result: WritableNativeMap = WritableNativeMap();
      if (subscription !== null) {
        result.putString("productId", subscription.productId);
        result.putString("expiresAt", subscription.expiresAt.toString());
        result.putString("statedAt", subscription.startedAt.toString());
        result.putString("cancelledAt", subscription.cancelledAt.toString());
        result.putBoolean("isInRetryBilling", subscription.isInRetryBilling);
        result.putBoolean("isAutoRenewEnabled", subscription.isAutoRenewEnabled);
        result.putBoolean("isIntroductoryActivated", subscription.isIntroductoryActivated);
        result.putBoolean("isActive", subscription.isActive());
        result.putString("kind", subscription.kind.toString());
        result.putString("status", subscription.status.toString());
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun nonRenewingPurchases(promise: Promise) {
      val result: WritableNativeArray = WritableNativeArray();
      for (purchase in Apphud.nonRenewingPurchases()) {
        val item: WritableNativeMap = WritableNativeMap();
        item.putString("productId", purchase.productId);
        item.putString("purchasedAt", purchase.purchasedAt.toString());
        item.putString("canceledAt", purchase.canceledAt.toString());
        item.putBoolean("isActive", purchase.isActive());
        result.pushMap(item);
      }
      promise.resolve(result);
    }

    @ReactMethod
    fun product(productIdentifier: String, promise: Promise) {
      val product = Apphud.product(productIdentifier);
      if (product != null) {
        val item = WritableNativeMap();
        item.putString("id", product.sku);
        item.putString("price", product.price);
        item.putString("currencyCode", product.priceCurrencyCode);
        promise.resolve(item);
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
    fun setUserProperty(key: String, value: String, setOnce: Boolean,  promise: Promise) {
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
      promise.reject(this.unSupportMethodMsg);
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
