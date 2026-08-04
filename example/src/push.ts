import { NativeModules, Platform } from 'react-native';

type ExamplePushNative = {
  submitCurrentToken(): Promise<boolean>;
};

const ExamplePush = NativeModules.ExamplePush as ExamplePushNative | undefined;

/**
 * Re-submit the platform push token to Apphud after `Apphud.start`.
 *
 * - iOS: re-submits the cached APNs token (or triggers registration if none yet).
 * - Android: fetches the current FCM token and submits it.
 *
 * Native FCM / APNs handlers also submit automatically when a token arrives;
 * this call covers the common case where the token was received before start.
 */
export async function submitExamplePushToken(): Promise<boolean> {
  if (!ExamplePush?.submitCurrentToken) {
    console.log(
      `[ApphudExample] ExamplePush native module is not linked (${Platform.OS})`
    );
    return false;
  }

  try {
    const success = await ExamplePush.submitCurrentToken();
    console.log(
      `[ApphudExample] submitExamplePushToken success=${success} (${Platform.OS})`
    );
    return success;
  } catch (error) {
    console.log('[ApphudExample] submitExamplePushToken failed:', error);
    return false;
  }
}
