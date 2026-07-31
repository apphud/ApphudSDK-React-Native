import { NativeModules, Platform } from 'react-native';
import {
  PaywallScreenPresenter,
  type Options as PaywallScreenPresenterOptions,
} from './PaywallScreenPresenter';
import type {
  StartProperties,
  ApphudProduct,
  ApphudPurchaseResult,
  RestorePurchase,
  ApphudPurchaseProps,
  ApphudPurchasePromoProps,
  ApphudSubscription,
  ApphudNonRenewingPurchase,
  AttributionProperties,
  ApphudUserPropertyKey,
  ApphudWebRestoreResult,
  ApphudUser,
  ApphudPlacement,
  ApphudRule,
  Identifiers,
  PaywallLogsInfo,
  PlacementsOptions,
  CommitmentPlanProductOptions,
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
   * Returns the placements from Mission control > Placements, potentially altered based on
   * the user's involvement in A/ B testing, if applicable.
   *
   */
  placements(options: Partial<PlacementsOptions>): Promise<ApphudPlacement[]>;

  /**
   * Available on iOS and Android.
   *
   * Returns a single placement by identifier. Awaits until store products are loaded.
   */
  placement(
    identifier: string,
    options?: Partial<PlacementsOptions>
  ): Promise<ApphudPlacement | null>;

  /**
   * Available on iOS and Android.
   *
   * Returns placements immediately without awaiting store products.
   */
  rawPlacements(): Promise<ApphudPlacement[]>;

  /**
   * Available on iOS and Android.
   *
   * Overrides API gateway host. Must be called before `start` / `startManually`.
   */
  setHost(url: string): void;

  /**
   * Available on iOS and Android.
   *
   * Forwards a deep link opened by the user (Universal Link / App Link or custom scheme URL)
   * to Apphud and triggers direct deep link attribution. May be called multiple times
   * during the app lifecycle.
   *
   * Wire it to React Native `Linking`:
   * ```ts
   * Linking.getInitialURL().then((url) => url && ApphudSdk.handleDeeplinkUrl(url));
   * Linking.addEventListener('url', ({ url }) => ApphudSdk.handleDeeplinkUrl(url));
   * ```
   *
   * The attribution result is delivered via `ApphudSdkEventEmitter.onApphudDeeplinkAttribution`
   * with kind `direct`.
   */
  handleDeeplinkUrl(url: string): void;

  /**
   * Available on iOS and Android.
   *
   * Requests deferred deep link attribution for the current app installation.
   * Call it after SDK initialization, typically once on first launch, while the app
   * is in the foreground.
   *
   * The result is delivered via `ApphudSdkEventEmitter.onApphudDeeplinkAttribution`
   * with kind `deferred`. When no match is found, `attribution` is an empty object.
   */
  requestDeferredDeeplinkAttribution(): Promise<void>;

  /**
   * Available on iOS (Android returns false).
   *
   * Whether commitment plan is preferred for the product in Mission control.
   */
  isCommitmentPlanPreferred(
    options: CommitmentPlanProductOptions
  ): Promise<boolean>;

  /**
   * Available on iOS 26.4+ (Android returns false).
   *
   * Whether commitment plan is supported on this device for the product.
   */
  isCommitmentPlanSupported(
    options: CommitmentPlanProductOptions
  ): Promise<boolean>;

  /**
   * Available on iOS and Android.
   * Logs a "Paywall Shown" (Paywall View) event which is required for A/B Testing Analytics.
   */
  paywallShown(options: PaywallLogsInfo & Partial<PlacementsOptions>): void;

  /**
   * Available on iOS and Android.
   * Logs a "Paywall Closed" event. Optional.
   */
  paywallClosed(options: PaywallLogsInfo & Partial<PlacementsOptions>): void;

  /**
   * Available on iOS and Android.
   *
   * Note that you have to add all product identifiers in Apphud Mission control > Products.
   *
   * **Important**: Best practise is not to use this method,
   * but implement paywalls logic by adding your paywall configuration in Apphud Mission control > Paywalls.
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
   * Makes purchase of `ApphudProduct` object from your `ApphudPaywall`.
   * You must first configure paywalls in Apphud Mission control > Paywalls.
   * @param props - object with productId and optional paywallId, offerToken, isConsumable. See `ApphudPurchaseProps` for details.
   * @returns `ApphudPurchaseResult` object. See `ApphudPurchaseResult` for details.
   */
  purchase(
    props: ApphudPurchaseProps & Partial<PlacementsOptions>
  ): Promise<ApphudPurchaseResult>;

  /**
   * Available on iOS only.
   *
   * Checks whether the user is eligible to purchase promotional subscription offers
   * for the given product.
   */
  checkEligibilityForPromotionalOffer(
    props: ApphudPurchaseProps & Partial<PlacementsOptions>
  ): Promise<boolean>;

  /**
   * Available on iOS only.
   *
   * Purchases a promotional subscription offer. `discountID` must match
   * `SKProductDiscount.identifier` from App Store Connect.
   */
  purchasePromo(
    props: ApphudPurchasePromoProps & Partial<PlacementsOptions>
  ): Promise<ApphudPurchaseResult>;

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
   * @param {AttributionProperties} options.
   */
  setAttribution(options: AttributionProperties): Promise<boolean>;

  /**
   *  Web-to-Web flow only. Attempts to attribute the user with the provided attribution data.
   * If the `options` parameter contains either `apphud_user_id`, `email` or `apphud_user_email`,
   * the SDK will submit this information to the Apphud server.
   * The server will return ApphudWebRestoreResult.
   */
  attributeFromWeb(
    options: Record<string, string>
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
   * Submits Device Identifiers (IDFA and IDFV) to Apphud. These identifiers may be required for marketing
   *  and attribution platforms such as AppsFlyer, Facebook, Singular, etc.
   *
   * Best practice is to call this method right after SDK's `start(...)` method with at least IDFV and
   * once again after getting IDFA.
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
   * Available on iOS and Android.
   *
   * Manually polls the backend for unread Apphud Rules and presents a screen
   * when one is available. The SDK also checks for rules automatically after
   * user registration and periodically.
   */
  checkRules(): Promise<void>;

  /**
   * Available on iOS and Android.
   *
   * Returns the Apphud rule whose screen is currently pending or displayed, if any.
   */
  pendingRule(): Promise<ApphudRule | null>;

  /**
   * Available on iOS and Android.
   *
   * Presents a previously delayed rule screen.
   * Returns `true` when a pending screen was presented.
   */
  showPendingRuleScreen(): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * Provide your push notifications token to Apphud SDK. Required for Rules & Screens.
   *
   * **Important (iOS)**: string must be hexadecimal string representation of NSData / Data.
   * **Android**: pass the FCM registration token string.
   *
   * @returns `true` when the token was accepted by the SDK.
   */
  submitPushNotificationsToken(token: string): Promise<boolean>;

  /**
   * Available on iOS and Android.
   *
   * Pass push notification payload to Apphud SDK. Required for Rules & Screens.
   *
   * On Android, pass the FCM `message.data` map (must include `rule_id` for rules).
   *
   * @returns `true` when Apphud handled the payload as a rule notification.
   */
  handlePushNotification(payload: Record<string, unknown>): Promise<boolean>;

  /**
   * Available on iOS only.
   *
   * Returns the native identifierForVendor UUID string or null. On Android always returns null.
   *
   * See full description https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor
   */
  idfv(): Promise<string | null>;

  /**
   * Available on iOS only
   *
   * @param placementIdentifiers
   */
  preloadPaywallScreens?(placementIdentifiers: string[]): void;

  /**
   * Available on iOS only
   *
   * Unloads a previously fetched screen.
   *
   */
  unloadPaywallScreen(options: { placementIdentifier?: string }): Promise<void>;

  /**
   * Updates the user ID for the current user. Use only for authorized user session.
   * @param userID - The new user ID to be set for the current user.
   * @returns A promise that resolves to the updated user object if the update is successful, or null if the update fails.
   */
  updateUserID(userID: string): Promise<ApphudUser | null>;
}

const { ApphudSdk: _ApphudSdk } = NativeModules;

if (!_ApphudSdk && __DEV__) {
  console.error(
    'NativeModule "ApphudSdk" is not linked. Make sure to run pod install on iOS and rebuild your app'
  );
}

type ApphudSdkPresenterProvider = {
  /**
   *
   * @param options Uses for class constructor
   * @return instance of PaywallScreenPresenter
   */
  createPresenter(
    options: PaywallScreenPresenterOptions
  ): PaywallScreenPresenter;
};

const ApphudSdkBase = _ApphudSdk as IApphudSdk;

export const ApphudSdk: IApphudSdk & ApphudSdkPresenterProvider = {
  start: (options: StartProperties) => ApphudSdkBase.start(options),
  startManually: (options: StartProperties) =>
    ApphudSdkBase.startManually(options),
  userId: () => ApphudSdkBase.userId(),
  placements: (options?: Partial<PlacementsOptions>) =>
    ApphudSdkBase.placements(options ?? {}),
  placement: (identifier: string, options?: Partial<PlacementsOptions>) =>
    ApphudSdkBase.placement(identifier, options ?? {}),
  rawPlacements: () => ApphudSdkBase.rawPlacements(),
  setHost: (url: string) => ApphudSdkBase.setHost(url),
  handleDeeplinkUrl: (url: string) => ApphudSdkBase.handleDeeplinkUrl(url),
  requestDeferredDeeplinkAttribution: () =>
    ApphudSdkBase.requestDeferredDeeplinkAttribution(),
  isCommitmentPlanPreferred: (options: CommitmentPlanProductOptions) =>
    ApphudSdkBase.isCommitmentPlanPreferred(options),
  isCommitmentPlanSupported: (options: CommitmentPlanProductOptions) =>
    ApphudSdkBase.isCommitmentPlanSupported(options),
  paywallShown: (options: PaywallLogsInfo & Partial<PlacementsOptions>) =>
    ApphudSdkBase.paywallShown(options),
  paywallClosed: (options: PaywallLogsInfo) =>
    ApphudSdkBase.paywallClosed(options),
  products: () => ApphudSdkBase.products(),
  hasPremiumAccess: () => ApphudSdkBase.hasPremiumAccess(),
  hasActiveSubscription: () => ApphudSdkBase.hasActiveSubscription(),
  purchase: (props: ApphudPurchaseProps & Partial<PlacementsOptions>) =>
    ApphudSdkBase.purchase(props),
  checkEligibilityForPromotionalOffer: (
    props: ApphudPurchaseProps & Partial<PlacementsOptions>
  ) =>
    Platform.OS === 'ios'
      ? ApphudSdkBase.checkEligibilityForPromotionalOffer(props)
      : Promise.resolve(false),
  purchasePromo: (props: ApphudPurchasePromoProps & Partial<PlacementsOptions>) => {
    if (Platform.OS !== 'ios') {
      return Promise.reject(
        new Error('purchasePromo is only available on iOS')
      );
    }
    return ApphudSdkBase.purchasePromo(props);
  },
  restorePurchases: () => ApphudSdkBase.restorePurchases(),
  syncPurchasesInObserverMode: () =>
    ApphudSdkBase.syncPurchasesInObserverMode(),
  subscription: () => ApphudSdkBase.subscription(),
  subscriptions: () => ApphudSdkBase.subscriptions(),
  nonRenewingPurchases: () => ApphudSdkBase.nonRenewingPurchases(),
  isNonRenewingPurchaseActive: (productIdentifier: string) =>
    ApphudSdkBase.isNonRenewingPurchaseActive(productIdentifier),
  setAttribution: (options: AttributionProperties) =>
    ApphudSdkBase.setAttribution(options),
  attributeFromWeb: (options: Record<string, string>) =>
    ApphudSdkBase.attributeFromWeb(options),
  setUserProperty: (args: {
    key: ApphudUserPropertyKey | string;
    value: any;
    setOnce: boolean;
  }) => ApphudSdkBase.setUserProperty(args),
  incrementUserProperty: (args: {
    key: ApphudUserPropertyKey | string;
    by: number;
  }) => ApphudSdkBase.incrementUserProperty(args),
  collectDeviceIdentifiers: () => ApphudSdkBase.collectDeviceIdentifiers(),
  setDeviceIdentifiers: (options: Partial<Identifiers>) =>
    ApphudSdkBase.setDeviceIdentifiers(options),
  optOutOfTracking: () => ApphudSdkBase.optOutOfTracking(),
  logout: () => ApphudSdkBase.logout(),
  enableDebugLogs: () => ApphudSdkBase.enableDebugLogs(),
  checkRules: () => ApphudSdkBase.checkRules(),
  pendingRule: () => ApphudSdkBase.pendingRule(),
  showPendingRuleScreen: () => ApphudSdkBase.showPendingRuleScreen(),
  submitPushNotificationsToken: (token: string) =>
    ApphudSdkBase.submitPushNotificationsToken(token),
  handlePushNotification: (payload: Record<string, unknown>) =>
    ApphudSdkBase.handlePushNotification(payload),
  idfv: () => ApphudSdkBase.idfv(),
  preloadPaywallScreens:
    _ApphudSdk.preloadPaywallScreens &&
    ((placementIdentifiers: string[]) =>
      _ApphudSdk.preloadPaywallScreens(placementIdentifiers)),
  unloadPaywallScreen:
    _ApphudSdk.unloadPaywallScreen &&
    ((options: { placementIdentifier?: string }) =>
      _ApphudSdk.unloadPaywallScreen(options)),
  updateUserID: (userID: string) => ApphudSdkBase.updateUserID(userID),
  createPresenter: (options: PaywallScreenPresenterOptions) =>
    new PaywallScreenPresenter(options),
};
