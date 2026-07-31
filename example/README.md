# Example App

React Native demo for `@apphud/react-native-apphud-sdk`.

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### 1. Configure API keys

Copy `example/.env` (or create it) with platform-specific keys:

```
APPHUD_API_KEY_IOS=appstr_...
APPHUD_API_KEY_ANDROID=play_...
APPHUD_HOST=https://api.apphud.com
```

`APPHUD_API_KEY` is still accepted as a shared fallback for both platforms.

### 2. Start Metro

```sh
yarn start
```

### 3. Run the app

```sh
# Android
yarn android

# iOS (first time / after native dep changes)
cd ios && bundle exec pod install --repo-update && cd ..
yarn ios
```

## Rules & push notifications

The example wires push so Apphud Rules (Figma paywalls and legacy HTML screens) can be delivered.

### What happens automatically

1. After `ApphudSdk.start()` (login / auto-login), JS calls `ExamplePush.submitCurrentToken()` to (re)submit the platform push token.
2. Rule lifecycle events are logged in `App.tsx` (`onApphudRule*`).
3. Actions screen exposes **Check Rules**, **Log Pending Rule**, **Show Pending Rule Screen**, and **Submit Push Token**.

### iOS (APNs)

- `AppDelegate` requests notification permission and calls `registerForRemoteNotifications()`.
- Device token is submitted via native `Apphud.submitPushNotificationsToken`.
- Notification taps / foreground presentation forward `userInfo` to `Apphud.handlePushNotification`.
- Requires a real device (or a simulator with a working APNs setup) and Push Notifications capability (`aps-environment` entitlement is already present).

### Android (FCM)

- Uses the same Firebase project / `google-services.json` as the Flutter demo (`applicationId` / package `com.apphud.demo`).
- `ExampleFirebaseMessagingService` submits new FCM tokens and forwards data payloads with `rule_id` to `Apphud.handlePushNotification`.
- `MainActivity` requests `POST_NOTIFICATIONS` on Android 13+.
- `ExamplePush.submitCurrentToken()` fetches the current FCM token and submits it after SDK start.

Host apps should mirror this pattern with their own Firebase project and messaging service.
