import { NativeModules } from 'react-native';
import type {
  ApphudPaywall,
  StartProperties,
  ApphudProduct,
  ApphudPurchaseResult,
  RestorePurchase,
  ApphudPurchaseProps,
  ApphudSubscription,
  ApphudNonRenewingPurchase,
  AttributionProperties,
  ApphudUserPropertyKey,
  ApphudWebRestoreResult,
  ApphudUser,
  ApphudPlacement,
  Identifiers,
} from './types';

interface IApphudSdk {
  /**
   * Available on iOS and Android.
   *
   * Initializes Apphud SDK. You should call it during app launch.
   * @param options - object with apiKey and optional userId, deviceId, observerMode. See `StartProperties` for details.
   */
  start(options: StartProperties): Promise<ApphudUser>;

  /**
   * Available on iOS and Android.
   *
   * Initializes Apphud SDK with User ID & Device ID pair. Not recommended for use unless you know what you are doing.
   * @param options - object with apiKey and optional userId, deviceId, observerMode. See `StartProperties` for details.
   */
  startManually(options: StartProperties): Promise<ApphudUser>;

  /**
   * Available on iOS and Android.
   * @returns current userID that identifies user across his multiple devices.
   */
  userId(): Promise<string>;

  /**
   * Available on iOS and Android.
   *
   * Each paywall contains an array of `ApphudProduct` objects that you use for purchase.
   * `ApphudProduct` is Apphud's wrapper around `SKProduct`/ `ProductDetails` models.
   * Method returns immediately if paywalls are cached or already loaded.
   * @returns paywalls configured in Apphud Dashboard > Product Hub > Paywalls.
   */
  paywalls(): Promise<Array<ApphudPaywall>>;

  /**
   * Available on iOS and Android
   * Logs a "Paywall Shown" (Paywall View) event which is required for A/B Testing Analytics.
   */
  paywallShown(identifier: string): void;

  /**
   * Available on iOS and Android
   * Logs a "Paywall Closed" event. Optional.
   */
  paywallClosed(identifier: string): void;

  /**
   * Available on iOS and Android.
   *
   * Note that you have to add all product identifiers in Apphud Dashboard > Product Hub > Products.
   *
   * **Important**: Best practise is not to use this method,
   * but implement paywalls logic by adding your paywall configuration in Apphud Dashboard > Product Hub > Paywalls.
   * @returns `SKProducts` / `ProductDetails` array or fetches products from the App Store or Google Play.
   */
  products(): Promise<Array<ApphudProduct>>;

  /**
   * Available on iOS and Android.
   *
   * Use this method to determine whether or not user has active premium access.
   * If you have consumable purchases, this method won't operate correctly,
   * because Apphud SDK doesn't differ consumables from non-consumables.
   *
   * **Important**: You should not use this method if you have consumable in-app purchases, like coin packs.
   * @returns `true` if user has active subscription or non renewing purchase (lifetime), `false` if not.
   */
  hasPremiumAccess(): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * Use this method to determine whether or not user has active premium subscription.
   *
   * **Important**: Note that if you have lifetime (nonconsumable) or consumable purchases,
   * you must use another `isNonRenewingPurchaseActive(productIdentifier:)` method.
   * @returns `true` if user has active subscription, `false` if not.
   */
  hasActiveSubscription(): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * Makes purchase of `ApphudProduct` object from your `ApphudPaywall`. You must first configure paywalls in Apphud Dashboard > Product Hub > Paywalls.
   * @param props - object with productId and optional paywallId, offerToken, isConsumable. See `ApphudPurchaseProps` for details.
   * @returns `ApphudPurchaseResult` object. See `ApphudPurchaseResult` for details.
   */
  purchase(props: ApphudPurchaseProps): Promise<ApphudPurchaseResult>;

  /**
   * Available on iOS and Android.
   *
   * Restores user's purchase history.
   * @returns RestorePurchase object. See `RestorePurchase` for details.
   */
  restorePurchases(): Promise<RestorePurchase>;

  /**
   * Available on Android only.
   *
   * Synchronizes user's purchases with Apphud servers.
   * Should be called only in Observer Mode after purchase or restore.
   * @returns `true` if sync was successful, `false` if not.
   */
  syncPurchasesInObserverMode(): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * **Important**: Having a subscription doesn't mean that subsription is active, it may be expired or canceled.
   * Check subscription's status to know whether subscription is active.
   * @returns subscription object that current user has ever purchased. Subscriptions are cached on device.
   */
  subscription(): Promise<ApphudSubscription>;

  /**
   * Available on iOS and Android.
   *
   * **Important**: Having a subscription doesn't mean that subsription is active, it may be expired or canceled.
   * Check subscription's status to know whether subscription is active.
   * @returns subscriptions array that current user has ever purchased. Subscriptions are cached on device.
   */
  subscriptions(): Promise<Array<ApphudSubscription>>;

  /**
   * Available on iOS and Android.
   *
   * Purchases are cached on device. This array is sorted by purchase date.
   * Apphud only tracks consumables if they were purchased after integrating Apphud SDK.
   * @returns array of in-app purchases (consumables, or nonconsumables) that user has ever purchased.
   */
  nonRenewingPurchases(): Promise<Array<ApphudNonRenewingPurchase>>;

  /**
   * Available on iOS and Android.
   *
   * @param productIdentifier - product identifier of non-renewing purchase.
   * @returns `true` if non-renewing purchase is active, `false` if not.
   */
  isNonRenewingPurchaseActive(productIdentifier: string): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * Submit attribution data to Apphud from your attribution network provider.
   * @param options - object with data, identifier, attributionProviderId. See `AttributionProperties` for details.
   */
  addAttribution(options: AttributionProperties): void;

  /**
   *  Web-to-Web flow only. Attempts to attribute the user with the provided attribution data.
   * If the `options` parameter contains either `apphud_user_id`, `email` or `apphud_user_email`,
   * the SDK will submit this information to the Apphud server.
   * The server will return ApphudWebRestoreResult.
   */
  attributeFromWeb(
    options: Partial<{
      apphud_user_id: string;
      email: string;
      apphud_user_email: string;
    }>
  ): Promise<ApphudWebRestoreResult>;

  /**
   * Available on iOS and Android.
   *
   * Set custom user property.
   * @param key -  You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param value - Value must be a number, string, boolean or null. Passing a null value removes the property.
   * @param setOnce - if true, the property will be set only once and then it won't be updated.
   */
  setUserProperty(args: {
    key: ApphudUserPropertyKey | string;
    value: any;
    setOnce: boolean;
  }): void;

  /**
   * Available on iOS and Android.
   *
   * Increment custom user property.
   * @param key - You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param by - Value must be a number.
   */
  incrementUserProperty(args: {
    key: ApphudUserPropertyKey | string;
    by: number;
  }): void;

  /**
   * Available on Android only.
   *
   * Call this method after SDK initialization to collect device identifiers
   * that are required for some third-party integrations, like AppsFlyer, Adjust, Singular, etc.
   * Identifiers include Advertising ID, Android ID, App Set ID.
   *
   * **Important**: To collect Advertising ID, you must add `AD_ID` permission to the Manifest file.
   */
  collectDeviceIdentifiers(): void;

  /**
   * Available on iOS only.
   *
   * Submits Device Identifiers (IDFA and IDFV) to Apphud. These identifiers may be required for marketing and attribution platforms such as AppsFlyer, Facebook, Singular, etc.
   *
   * Best practice is to call this method right after SDK's `start(...)` method with at least IDFV and once again after getting IDFA.
   *
   * @param {Partial<Identifiers>} options
   *
   */
  setDeviceIdentifiers(options: Partial<Identifiers>): void;

  /**
   * Available on iOS and Android.
   *
   * Must be called before SDK initialization.
   * If called, some parameters including IDFA, IDFV, IP address, Advertising ID, Android ID, App Set ID, Device Type
   * **would not** be collected by Apphud.
   */
  optOutOfTracking(): void;

  /**
   * Available on iOS and Android.
   *
   * Logs out current user, clears all saved data and resets SDK to uninitialized state.
   * You will need to call `start` or `startManually` again to initilize SDK with a new user.
   * This might be useful if you have your custom logout/login flow
   * and you want to take control of each logged-in user's subscription status.
   *
   * **Important**: If previous user had active subscription,
   * the new logged-in user can still restore purchases on this device
   * and both users will be merged under the previous paid one, because Apple ID / Google Account is tied to a device.
   */
  logout(): Promise<void>;

  /**
   * Available on iOS and Android.
   *
   * Enable debug logs in the console. Should be called in debug mode only.
   */
  enableDebugLogs(): void;

  /**
   * Available on iOS only.
   *
   * Provide your push notifications token to Apphud SDK. Required for Rules & Screens.
   *
   * **Important**: string must be hexadecimal string representation of NSData / Data.
   */
  submitPushNotificationsToken(token: string): void;

  /**
   * Available on iOS only.
   *
   * Pass push notification payload to Apphud SDK. Required for Rules & Screens.
   */
  handlePushNotification(payload: any): void;

  /**
   * Available on iOS and Android.
   *
   * Returns the placements from Product Hub > Placements, potentially altered based on the user's involvement in A/ B testing, if applicable
   *
   */
  placements(): Promise<ApphudPlacement[]>;

  /**
   * Available on iOS
   *
   * Returns the native identifierForVendor UUID or null. On Android always returns null
   *
   * See full description https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor
   */
  idfv(): Promise<string | null>;
}

const { ApphudSdk: _ApphudSdk } = NativeModules;

if (!_ApphudSdk && __DEV__) {
  console.error(
    'NativeModule "ApphudSdk" is not linked. Make sure to run pod install on iOS and rebuild your app'
  );
}

export const ApphudSdk = _ApphudSdk as IApphudSdk;
