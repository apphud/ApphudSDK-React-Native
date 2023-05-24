package com.reactnativeapphudsdk

import com.android.billingclient.api.SkuDetails
import com.apphud.sdk.ApphudPurchaseResult
import com.apphud.sdk.domain.ApphudNonRenewingPurchase
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.domain.ApphudSubscription
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableNativeArray
import com.facebook.react.bridge.WritableNativeArray
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

    fun getSkuDetailsMap(skuDetails: SkuDetails): WritableNativeMap {
      val payload: WritableNativeMap = WritableNativeMap();
      payload.putString("price", skuDetails.price);
      payload.putString("sku", skuDetails.sku);
      payload.putString("description", skuDetails.description);
      payload.putString("title", skuDetails.title);
      payload.putString("freeTrialPeriod", skuDetails.freeTrialPeriod);
      payload.putString("introductoryPrice", skuDetails.introductoryPrice);
      payload.putString("introductoryPriceAmountMicros", skuDetails.introductoryPriceAmountMicros.toString());
      payload.putInt("introductoryPriceCycles", skuDetails.introductoryPriceCycles);
      payload.putString("introductoryPricePeriod", skuDetails.introductoryPricePeriod);
      payload.putString("priceAmountMicros", skuDetails.priceAmountMicros.toString());
      payload.putString("priceCurrencyCode", skuDetails.priceCurrencyCode);
      payload.putString("subscriptionPeriod", skuDetails.subscriptionPeriod);
      payload.putString("type", skuDetails.type);
      payload.putString("originalPrice", skuDetails.originalPrice);
      payload.putString("originalPriceAmountMicros", skuDetails.originalPriceAmountMicros.toString());
      return payload;
    }

    fun getApphudProductMap(apphudProduct: ApphudProduct): WritableNativeMap {
      val payload: WritableNativeMap = WritableNativeMap();
      payload.putString("id", apphudProduct.id);
      payload.putString("productId", apphudProduct.product_id);
      payload.putString("name", apphudProduct.name);
      payload.putString("store", apphudProduct.store);
      payload.putString("paywallId", apphudProduct.paywall_id);
      payload.putString("paywallIdentifier", apphudProduct.paywall_identifier);
      payload.putMap("product", apphudProduct.skuDetails?.let { getSkuDetailsMap(it) });
      return payload;
    }

    fun getApphudPaywallMap(paywall: ApphudPaywall): WritableNativeMap {
      val result: WritableNativeMap = WritableNativeMap();
      result.putString("identifier", paywall.identifier);
      result.putBoolean("isDefault", paywall.default);
      result.putString("experimentName", paywall.experimentName);
      result.putString("variationName", paywall.variationName);
      result.putString("json",paywall.json.toString());
      val array: WritableNativeArray = WritableNativeArray();
      paywall.products?.map { it
          array.pushMap(getApphudProductMap(it))
      }
      result.putArray("products", array)
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
      if (purchase != null) {
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

    fun getApphudProduct(args: ReadableMap): ApphudProduct {
      val productId = args.getString("productId") ?: throw IllegalArgumentException("productId is required argument");
      val id = args.getString("id");
      val name = args.getString("name");
      val store = args.getString("store") ?: throw IllegalArgumentException("store is required argument");
      val paywallId = args.getString("paywallId");
      val paywallIdentifier = args.getString("paywallIdentifier");
      return ApphudProduct(
        id = id,
        product_id = productId,
        name = name,
        store = store,
        paywall_id = paywallId,
        skuDetails = null,
        paywall_identifier = paywallIdentifier
      )
    }
  }
}
