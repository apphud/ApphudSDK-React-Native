import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ApphudSdk } from '@apphud/react-native-apphud-sdk';
import {
  APPHUD_API_KEY,
  APPHUD_API_KEY_ANDROID,
  APPHUD_API_KEY_IOS,
  APPHUD_HOST,
} from '@env';
import { submitExamplePushToken } from './push';

const API_KEY_STORAGE_KEY = 'apphud_demo_api_key';

export function getDefaultApiKey(): string {
  const platformKey =
    Platform.OS === 'android'
      ? APPHUD_API_KEY_ANDROID
      : APPHUD_API_KEY_IOS;

  return platformKey?.trim() || APPHUD_API_KEY?.trim() || '';
}

export async function getStoredApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(API_KEY_STORAGE_KEY);
}

export async function setStoredApiKey(apiKey: string): Promise<void> {
  await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export async function clearStoredApiKey(): Promise<void> {
  await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
}

type StartSessionOptions = {
  apiKey?: string | null;
  userId?: string | null;
  deviceId?: string | null;
  persist?: boolean;
};

export async function startApphudSession({
  apiKey,
  userId,
  deviceId,
  persist = true,
}: StartSessionOptions = {}): Promise<string> {
  const resolvedApiKey =
    apiKey?.trim() || getDefaultApiKey() || (await getStoredApiKey()) || '';

  if (!resolvedApiKey) {
    throw new Error(
      'Missing API key. Add APPHUD_API_KEY_IOS / APPHUD_API_KEY_ANDROID (or APPHUD_API_KEY) to example/.env.'
    );
  }

  const resolvedHost = APPHUD_HOST?.trim();
  if (resolvedHost) {
    await ApphudSdk.setHost(resolvedHost);
  }

  await ApphudSdk.start({
    apiKey: resolvedApiKey,
    userId: userId || undefined,
    deviceId: deviceId || undefined,
    observerMode: false,
  });
  await ApphudSdk.setDeviceIdentifiers({
    idfv: (await ApphudSdk.idfv()) ?? undefined,
  });

  // Re-submit push token after start so Rules can be delivered via push.
  // Native FCM/APNs handlers also submit on token refresh.
  await submitExamplePushToken();

  if (persist) {
    await setStoredApiKey(resolvedApiKey);
  }

  return resolvedApiKey;
}
