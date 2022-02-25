package com.reactnativeapphudsdk

import com.android.billingclient.api.SkuDetails
import com.apphud.sdk.ApphudPurchaseResult
import com.apphud.sdk.domain.ApphudNonRenewingPurchase
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.domain.ApphudSubscription
import com.facebook.react.bridge.WritableNativeMap

class ApphudDataTransformer {
  companion object {
    fun getSubscriptionMap(subscription: ApphudSubscription): WritableNativeMap {
      val result: WritableNativeMap = WritableNativeMap();
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
      return result;
    }

    fun getNonRenewingPurchaseMap(purchase: ApphudNonRenewingPurchase): WritableNativeMap {
      val item: WritableNativeMap = WritableNativeMap();
      item.putString("productId", purchase.productId);
      item.putString("purchasedAt", purchase.purchasedAt.toString());
      item.putString("canceledAt", purchase.canceledAt.toString());
      item.putBoolean("isActive", purchase.isActive());
      return item;
    }

    fun getPurchaseMap(result: ApphudPurchaseResult): WritableNativeMap {
      val item: WritableNativeMap = WritableNativeMap();
      val purchase = result.purchase;
      if (purchase !== null) {
        item.putString("orderId", purchase.orderId);
        item.putString("originalJson", purchase.originalJson);
        item.putString("packageName", purchase.packageName);
        item.putInt("purchaseState", purchase.purchaseState as Int);
        item.putInt("purchaseTime", purchase.purchaseTime.toInt());
        item.putString("purchaseToken", purchase.purchaseToken);
        item.putString("signature", purchase.signature);
        item.putString("sku", purchase.skus.first());
      }
      return item;
    }

    fun getProductMap(product: SkuDetails): WritableNativeMap {
      val item = WritableNativeMap();

      item.putString("id", product.sku);
      item.putString("description", product.description);
      item.putString("freeTrialPeriod", product.freeTrialPeriod);
      item.putString("introductoryPrice", product.introductoryPrice);
      item.putInt("introductoryPriceAmountMicros", product.introductoryPriceAmountMicros.toInt());
      item.putInt("introductoryPriceCycles", product.introductoryPriceCycles);
      item.putString("introductoryPricePeriod", product.introductoryPricePeriod);
      item.putInt("priceAmountMicros", product.priceAmountMicros.toInt());
      item.putString("priceCurrencyCode", product.priceCurrencyCode);
      item.putString("subscriptionPeriod", product.subscriptionPeriod);
      item.putString("title", product.title);
      item.putString("originalPrice", product.originalPrice);
      item.putString("price", product.price);
      item.putString("currencyCode", product.priceCurrencyCode);
      item.putInt("originalPriceAmountMicros", product.originalPriceAmountMicros.toInt());
      item.putString("type", product.type);

      return item;
    }
  }
}
