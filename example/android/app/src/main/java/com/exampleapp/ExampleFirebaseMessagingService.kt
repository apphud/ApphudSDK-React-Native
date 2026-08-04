package com.exampleapp

import android.util.Log
import com.apphud.sdk.Apphud
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * Forwards FCM tokens and data payloads to Apphud so Rules (including Figma
 * rule paywalls) can be delivered via push. Mirrors Flutter's
 * ExampleFirebaseMessagingService.
 */
class ExampleFirebaseMessagingService : FirebaseMessagingService() {

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    Log.d(TAG, "onNewToken: $token")
    Apphud.submitPushNotificationsToken(token) { success ->
      Log.d(TAG, "submitPushNotificationsToken success=$success, push token=$token")
    }
  }

  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)

    val title = message.notification?.title
    val body = message.notification?.body
    Log.d(
      TAG,
      "onMessageReceived data=\n${
        message.data.entries.joinToString(separator = "\n") { "    ${it.key}: ${it.value}" }
      },\nnotification title=$title, body=$body"
    )

    if (!message.data.containsKey("rule_id")) {
      Log.w(TAG, "Push has no rule_id — Apphud rules require a data payload with rule_id")
    }

    val handledByApphud =
      Apphud.handlePushNotification(HashMap<String, Any>(message.data))
    if (handledByApphud) {
      Log.d(TAG, "Push handled by Apphud rule engine")
    } else {
      Log.d(TAG, "Push was not an Apphud rule, handle it in your own app logic")
    }
  }

  private companion object {
    const val TAG = "ApphudExample"
  }
}
