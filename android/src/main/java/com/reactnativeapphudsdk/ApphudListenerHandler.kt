package com.reactnativeapphudsdk

import android.net.Uri
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudDeeplinkAttributionKind
import com.apphud.sdk.ApphudListener
import com.apphud.sdk.domain.ApphudPlacement
import com.apphud.sdk.domain.ApphudUser
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

/**
 * Rule events are produced by [ApphudRuleCallbackHandler], which is owned by
 * [ApphudSdkModule]. Turbo Native Module events can only be emitted from the
 * module that declares them, so rule callbacks are routed back here.
 */
internal enum class ApphudRuleEvent {
  SCREEN_DID_APPEAR,
  WILL_PURCHASE,
  PURCHASE_COMPLETED,
  SCREEN_WILL_DISMISS,
  SCREEN_DID_DISMISS,
  DID_SELECT_SURVEY_ANSWER,
  PAYWALL_WITHOUT_SCREEN,
}

class ApphudListenerHandler(private val reactContext: ReactApplicationContext) :
  NativeApphudSdkEventsSpec(reactContext), ApphudListener {

  init {
    current = this
    Apphud.setListener(this)
    Apphud.setDeeplinkHandler { attribution, kind, uri ->
      emitDeeplinkAttribution(attribution, kind, uri)
    }
  }

  override fun invalidate() {
    if (current === this) {
      current = null
    }
    super.invalidate()
  }

  /** iOS-only: the App Store product identifiers allow-list. */
  override fun setApphudProductIdentifiers(ids: ReadableArray, promise: Promise) {
    promise.resolve(ids)
  }

  /** iOS-only: Rules screens presentation style. Safe no-op on Android. */
  override fun setScreenPresentationStyle(style: String, promise: Promise) {
    promise.resolve(null)
  }

  internal fun emitRuleEvent(event: ApphudRuleEvent, body: WritableMap) {
    runOnUiThread {
      when (event) {
        ApphudRuleEvent.SCREEN_DID_APPEAR -> emitOnApphudRuleScreenDidAppear(body)
        ApphudRuleEvent.WILL_PURCHASE -> emitOnApphudRuleWillPurchase(body)
        ApphudRuleEvent.PURCHASE_COMPLETED -> emitOnApphudRulePurchaseCompleted(body)
        ApphudRuleEvent.SCREEN_WILL_DISMISS -> emitOnApphudRuleScreenWillDismiss(body)
        ApphudRuleEvent.SCREEN_DID_DISMISS -> emitOnApphudRuleScreenDidDismiss(body)
        ApphudRuleEvent.DID_SELECT_SURVEY_ANSWER -> emitOnApphudRuleDidSelectSurveyAnswer(body)
        ApphudRuleEvent.PAYWALL_WITHOUT_SCREEN -> emitOnApphudRulePaywallWithoutScreen(body)
      }
    }
  }

  private fun emitDeeplinkAttribution(
    attribution: Map<String, Any>,
    kind: ApphudDeeplinkAttributionKind,
    uri: Uri?
  ) {
    val kindValue = when (kind) {
      ApphudDeeplinkAttributionKind.DEFERRED -> "deferred"
      else -> "direct"
    }

    // Deferred attribution may be delivered from a background thread.
    runOnUiThread {
      val body = WritableNativeMap().apply {
        putMap("attribution", attribution.toWritableNativeMap())
        putString("kind", kindValue)
        putString("url", uri?.toString())
      }

      emitOnApphudDeeplinkAttribution(body)
    }
  }

  override fun apphudDidChangeUserID(userId: String) {
    runOnUiThread {
      emitOnApphudDidChangeUserID(userId)
    }
  }

  override fun apphudFetchProductDetails(details: List<ProductDetails>) {
    runOnUiThread {
      emitOnApphudDidLoadStoreProducts(details.toWritableNativeArray { it.toMap() })
    }
  }

  override fun placementsDidFullyLoad(placements: List<ApphudPlacement>) {
    runOnUiThread {
      emitOnPlacementsDidFullyLoad(placements.toWritableNativeArray { it.toMap() })
    }
  }

  override fun userDidLoad(user: ApphudUser) {
    runOnUiThread {
      emitOnUserDidLoad(user.toMap())
    }
  }

  override fun apphudDidReceivePurchase(purchase: Purchase) {
    // do nothing
  }

  companion object {
    const val NAME = NativeApphudSdkEventsSpec.NAME

    @Volatile
    internal var current: ApphudListenerHandler? = null
      private set
  }
}
