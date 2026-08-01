package com.reactnativeapphudsdk

import android.app.Activity
import com.apphud.sdk.ApphudError
import com.apphud.sdk.ApphudPurchaseResult
import com.apphud.sdk.ApphudRuleCallback
import com.apphud.sdk.ApphudScreenDismissAction
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudProduct
import com.apphud.sdk.domain.Rule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap

/**
 * Process-scoped Rules callback passed into [com.apphud.sdk.Apphud.start].
 * Gates always auto-allow (events-only bridge), matching Flutter.
 */
class ApphudRuleCallbackHandler(
  private val reactContext: ReactApplicationContext
) : ApphudRuleCallback {

  override fun provideActivity(): Activity? = reactContext.currentActivity

  override fun shouldPerformRule(rule: Rule): Boolean = true

  override fun shouldShowScreen(rule: Rule): Boolean = true

  override fun onScreenDismissAction(rule: Rule): ApphudScreenDismissAction =
    ApphudScreenDismissAction.THANK_AND_CLOSE

  override fun onScreenAppeared(rule: Rule) {
    emit(
      ApphudRuleEvent.SCREEN_DID_APPEAR,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
      }
    )
  }

  override fun onWillPurchase(rule: Rule, product: ApphudProduct?) {
    emit(
      ApphudRuleEvent.WILL_PURCHASE,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
        product?.let { putMap("product", it.toMap()) }
      }
    )
  }

  override fun onPurchaseCompleted(rule: Rule, result: ApphudPurchaseResult) {
    emit(
      ApphudRuleEvent.PURCHASE_COMPLETED,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
        putMap("result", result.toMap())
      }
    )
  }

  override fun onScreenWillDismiss(rule: Rule, error: ApphudError?) {
    emit(
      ApphudRuleEvent.SCREEN_WILL_DISMISS,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
        putString("error", error?.message)
      }
    )
  }

  override fun onScreenDidDismiss(rule: Rule) {
    emit(
      ApphudRuleEvent.SCREEN_DID_DISMISS,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
      }
    )
  }

  override fun onDidSelectSurveyAnswer(rule: Rule, question: String, answer: String) {
    emit(
      ApphudRuleEvent.DID_SELECT_SURVEY_ANSWER,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
        putString("question", question)
        putString("answer", answer)
      }
    )
  }

  override fun onRulePaywallWithoutScreen(rule: Rule, paywall: ApphudPaywall) {
    emit(
      ApphudRuleEvent.PAYWALL_WITHOUT_SCREEN,
      WritableNativeMap().apply {
        putMap("rule", rule.toMap())
        putMap("paywall", paywall.toMap())
      }
    )
  }

  private fun emit(event: ApphudRuleEvent, body: WritableNativeMap) {
    ApphudListenerHandler.current?.emitRuleEvent(event, body)
  }
}
