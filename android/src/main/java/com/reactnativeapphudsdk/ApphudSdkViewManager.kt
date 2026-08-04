package com.reactnativeapphudsdk

import android.view.View
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.PaywallScreenViewManagerDelegate
import com.facebook.react.viewmanagers.PaywallScreenViewManagerInterface

/**
 * Placeholder Fabric component for `PaywallScreenView`.
 *
 * The Android Apphud SDK only exposes paywall screens as a modal
 * (`Apphud.showPaywallScreen`), so there is nothing to embed yet. The manager
 * exists so the component resolves and renders an empty view instead of
 * crashing; use `ApphudSdk.createPresenter(...)` on Android.
 */
@ReactModule(name = ApphudSdkViewManager.NAME)
class ApphudSdkViewManager :
  SimpleViewManager<View>(), PaywallScreenViewManagerInterface<View> {

  private val delegate: ViewManagerDelegate<View> = PaywallScreenViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<View> = delegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): View = View(context)

  @ReactProp(name = "placementIdentifier")
  override fun setPlacementIdentifier(view: View, value: String?) {
    // no-op: embedded paywall screens are iOS-only
  }

  @ReactProp(name = "requestPlacementsOptions")
  override fun setRequestPlacementsOptions(view: View, value: ReadableMap?) {
    // no-op: embedded paywall screens are iOS-only
  }

  override fun reload(view: View) {
    // no-op: embedded paywall screens are iOS-only
  }

  companion object {
    const val NAME = "PaywallScreenView"
  }
}
