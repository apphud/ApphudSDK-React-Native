package com.reactnativeapphudsdk

import com.apphud.sdk.Apphud
import com.apphud.sdk.domain.ApphudPaywallScreenShowResult
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.facebook.react.bridge.WritableMap

enum class PaywallscreenPresenterEvent {
  ERROR,
  SCREEN_SHOWN,
  CLOSE_BUTTON_TAPPED,
  TRANSACTION_COMPLETED,
  TRANSACTION_STARTED,
}

class PaywallscreenPresenterModule(
  private val reactApplicationContext: ReactApplicationContext
) : NativePaywallscreenPresenterSpec(reactApplicationContext) {

  override fun displayPaywallScreen(options: ReadableMap) {
    val paywallScreenPresenterId = options.getString("paywallScreenPresenterId") ?: return

    options.getString("placementIdentifier") ?: run {
      emit(PaywallscreenPresenterEvent.ERROR, paywallScreenPresenterId, "Paywall not found")
      return
    }

    Utils.paywall(options) { paywall ->
      if (paywall == null) {
        emit(PaywallscreenPresenterEvent.ERROR, paywallScreenPresenterId, "Paywall not found")
        return@paywall
      }

      val callbacks = Apphud.ApphudPaywallScreenCallbacks(
        onScreenShown = {
          emit(PaywallscreenPresenterEvent.SCREEN_SHOWN, paywallScreenPresenterId, null)
        },
        onTransactionStarted = {
          emit(
            PaywallscreenPresenterEvent.TRANSACTION_STARTED,
            paywallScreenPresenterId,
            it?.toMap()?.toJsonString()
          )
        },
        onTransactionCompleted = {
          if (it !is ApphudPaywallScreenShowResult.TransactionError) {
            emit(
              PaywallscreenPresenterEvent.TRANSACTION_COMPLETED,
              paywallScreenPresenterId,
              it.toMap().toJsonString()
            )
          }
        },
        onCloseButtonTapped = {
          emit(PaywallscreenPresenterEvent.CLOSE_BUTTON_TAPPED, paywallScreenPresenterId, null)
        },
        onScreenError = {
          emit(PaywallscreenPresenterEvent.ERROR, paywallScreenPresenterId, it.message)
        }
      )
      Apphud.showPaywallScreen(reactApplicationContext, paywall, callbacks = callbacks)
    }
  }

  /**
   * @param payload JSON-encoded event body, or a plain message for errors.
   *   `null` for events that carry no data.
   */
  private fun emit(
    event: PaywallscreenPresenterEvent,
    paywallScreenPresenterId: String,
    payload: String?
  ) {
    val body: WritableMap = Arguments.createMap().apply {
      putString("paywallScreenPresenterId", paywallScreenPresenterId)

      if (payload == null) {
        putNull("payload")
      } else {
        putString("payload", payload)
      }
    }

    runOnUiThread {
      when (event) {
        PaywallscreenPresenterEvent.ERROR -> emitOnError(body)
        PaywallscreenPresenterEvent.SCREEN_SHOWN -> emitOnScreenShown(body)
        PaywallscreenPresenterEvent.CLOSE_BUTTON_TAPPED -> emitOnCloseButtonTapped(body)
        PaywallscreenPresenterEvent.TRANSACTION_COMPLETED -> emitOnTransactionCompleted(body)
        PaywallscreenPresenterEvent.TRANSACTION_STARTED -> emitOnTransactionStarted(body)
      }
    }
  }

  companion object {
    const val NAME = NativePaywallscreenPresenterSpec.NAME
  }
}
