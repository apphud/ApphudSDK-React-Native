package com.exampleapp

import android.util.Log
import com.apphud.sdk.Apphud
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.FirebaseMessaging

/**
 * Lets JS re-submit the current FCM token after [Apphud.start]
 * (parity with Flutter's `submitCurrentToken` method channel).
 */
class ExamplePushModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ExamplePush"

  @ReactMethod
  fun submitCurrentToken(promise: Promise) {
    FirebaseMessaging.getInstance().token
      .addOnCompleteListener { task ->
        if (!task.isSuccessful) {
          Log.e(TAG, "Fetching FCM token failed", task.exception)
          promise.resolve(false)
          return@addOnCompleteListener
        }
        val token = task.result
        Log.d(TAG, "FCM token: $token")
        Apphud.submitPushNotificationsToken(token) { success ->
          Log.d(TAG, "submitPushNotificationsToken success=$success")
          promise.resolve(success)
        }
      }
  }

  private companion object {
    const val TAG = "ApphudExample"
  }
}
