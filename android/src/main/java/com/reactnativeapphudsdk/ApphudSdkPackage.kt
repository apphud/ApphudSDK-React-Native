package com.reactnativeapphudsdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class ApphudSdkPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    when (name) {
      ApphudSdkModule.NAME -> ApphudSdkModule(reactContext)
      ApphudListenerHandler.NAME -> ApphudListenerHandler(reactContext)
      PaywallscreenPresenterModule.NAME -> PaywallscreenPresenterModule(reactContext)
      else -> null
    }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(ApphudSdkViewManager())

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      ApphudSdkModule.NAME to ReactModuleInfo(
        name = ApphudSdkModule.NAME,
        className = ApphudSdkModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      ),
      // Eager: it installs the Apphud listener and deep link handler, which
      // must be in place before the first `Apphud.start` call.
      ApphudListenerHandler.NAME to ReactModuleInfo(
        name = ApphudListenerHandler.NAME,
        className = ApphudListenerHandler.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = true,
        isCxxModule = false,
        isTurboModule = true
      ),
      PaywallscreenPresenterModule.NAME to ReactModuleInfo(
        name = PaywallscreenPresenterModule.NAME,
        className = PaywallscreenPresenterModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      )
    )
  }
}
