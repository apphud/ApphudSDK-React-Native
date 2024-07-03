/*
Official Apphud SDK port for React Native.

*/
export type ApphudSdkType = {

  /**
    * Available on iOS and Android.
    * 
    * Initializes Apphud SDK. You should call it during app launch.
    * @param options - object with apiKey and optional userId, deviceId, observerMode. See `StartProperties` for details.
   */
  start(options: StartProperties): void;

  /**
   * Available on iOS and Android.
   * 
   * Initializes Apphud SDK with User ID & Device ID pair. Not recommended for use unless you know what you are doing.
   * @param options - object with apiKey and optional userId, deviceId, observerMode. See `StartProperties` for details.
   */ 
  startManually(options: StartProperties): void;
  
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
   * Available on iOS only.
   * 
   * Automatically collects Apple Search Ads attribution.
   */
  collectAppleSearchAdsAttribution(): void;

  /**
   * Available on iOS and Android.
   * 
   * Set custom user property.
   * @param key -  You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param value - Value must be a number, string, boolean or null. Passing a null value removes the property.
   * @param setOnce - if true, the property will be set only once and then it won't be updated.
   */
  setUserProperty(args: { key: ApphudUserPropertyKey | string, value: any, setOnce: boolean }): void;

  /**
   * Available on iOS and Android.
   * 
   * Increment custom user property.
   * @param key - You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param by - Value must be a number.
   */
  incrementUserProperty(args: { key: ApphudUserPropertyKey | string, by: number }): void;
  
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
   * Submit Advertising Identifier (IDFA) to Apphud. You should request ATT consent from the user to get IDFA.
   */
  setAdvertisingIdentifier(idfa: string): void;

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
  logout(): void;

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
};

/**
 * Properties for initializing Apphud SDK.
 */
export interface StartProperties {
  apiKey: string;

  /**
   * Optional. You can provide your own unique user identifier.
   * If not provided then UUID will be generated.
   */
  userId?: string;

  /**
   * Optional. Not recommended to use unless you know what you are doing.
   * You can provide your own unique device identifier. 
   * If not provided then UUID will be generated.
   */
  deviceId?: string;

  /**
   * Optional. Sets SDK to Observer (Analytics) mode. 
   * If you purchase products by your own code, then pass `true`. 
   * If you purchase products using `Apphud.purchase(product)` method, then pass `false`. 
   * 
   * Default value is `false`.
   */
  observerMode?: boolean;
}

/**
 * Props for making a purchase using Apphud.
 */
export interface ApphudPurchaseProps {
  /**
   * Identifier of the product you want to purchase. This should match the product ID configured in your app's store, e.g., com.product.id.
   * 
   * Available on both iOS and Android.
   */
  productId: string;

  /**
   * Paywall Identifier from the ApphudProduct object. Configure your Paywalls in Apphud Product Hub > Paywalls.
   * 
   * If you pass null, the purchase won't be attached to its paywall, which may result in incorrect analytics.
   * 
   * Available on both iOS and Android.
   */
  paywallId?: string;

  /**
   * Offer token is **mandatory** for purchasing subscriptions on Android.
   * 
   * Available on Android only.
   */
  offerToken?: string;

  /**
   * For one-time purchases, specify whether the product is consumable or acknowledgable.
   * 
   * Available on Android only.
   */
  isConsumable?: boolean;
}


export interface ApphudSubscription {

  /**
  Use this value to detect whether to give or not premium content to the user.
  
  @returns: `true` when user should have access to premium content. Otherwise `false`.
  */
  isActive: boolean;

  /**
   * Status of the subscription. It can only be in one state at any moment.
   
  * Possible values:

  * `trial`: Free trial period.
  * 
  * `intro`: One of introductory offers: "Pay as you go" or "Pay up front".
  * 
  * `promo`: Custom promotional offer.
  * 
  * `regular`: Regular paid subscription.
  * 
  * `grace`: Custom grace period. Configurable in web.
  * 
  * `refunded`: Subscription was refunded. Developer should treat this subscription as never purchased.
  * 
  * `expired`: Subscription has expired because has been canceled manually by user or had unresolved billing issues.
  */
  status: string;

  /**
     Product identifier of this subscription
     */
  productId: string;

  /**
     Expiration date of subscription period. 
     You shouldn't use this property to detect if subscription is active because user can change system date in iOS settings.
    Check isActive() method instead.
     */
  expiresAt: number;

  /**
   * Date when user has purchased the subscription. Timestamp in seconds.
   */
  startedAt: number;

  /**
   * Date when the subscription was refunded. Timestamp in seconds.
   */
  canceledAt?: number;

  /**
     Subscriptiona has failed to renew, but Apple / Google will try to charge the user later.
     */
  isInRetryBilling: boolean;

  /**
   False value means that user has canceled the subscription from App Store / Google Play settings. 
  */
  isAutoRenewEnabled: boolean;

  /**
     True value means that user has already used introductory offer for this subscription
      (free trial, pay as you go or pay up front).
  */  
  isIntroductoryActivated: boolean;
}

export interface ApphudNonRenewingPurchase {
  /**
    Product identifier of this purchase
  */
  productId: string;

  /**
    Date when user bought regular in-app purchase. Timestamp in seconds.
  */
  purchasedAt: string;

  /**
   * Date when the purchase has been refunded. Timestamp in seconds.
   */
  canceledAt?: string;

  /**
     Returns `true` if purchase is not refunded.
  */
  isActive: boolean;
}

export interface ApphudPurchaseResult {

  /**
  * Available on iOS and Android.  
  * 
  * Returns `true` if purchase was successful, `false` if not.
  */
  success: boolean

  /**
   * Available on iOS and Android.
   * 
   * Subscription object from the purchase result, if any.
   */
  subscription?: ApphudSubscription;

  /**
   * Available on iOS and Android.
   * 
   * Non-renewing purchase object from the purchase result, if any.
   */
  nonRenewingPurchase?: ApphudNonRenewingPurchase;

  /**
   * Available on iOS and Android.
   * 
   * Returns error object if purchase failed.
   */
  error?: {
    code: number;
    message: string;
  }

  /**
   * Available on iOS and Android.
   * 
   * Returns true if user canceled purchase.
   */
  userCanceled?: boolean;

  /**
   * Available on Android only.
   * 
   * Transction details from Google Play.
   */
  playStoreTransaction?: {
    /* Android: Purchase class */
    orderId: string;
    purchaseState: number;
    purchaseTime: number;
    purchaseToken: string;
  };

  /**
   * Available on iOS only.
   * 
   * Transction details from App Store.
   */
  appStoreTransaction?: {
    /**
     * iOS: SKPaymentTransactionStatePurchasing = 0
     * iOS: SKPaymentTransactionStatePurchased = 1
     * iOS: SKPaymentTransactionStateFailed = 2
     * iOS: SKPaymentTransactionStateRestored = 3
     */
    state: number;
    productId: string;

    // these two values present only if state is purchased or restored (1 or 3)
    id?: string; // Transaction Identifer
    date?: number; // Timestanp in seconds.
  };
}

/**
 * Available on iOS and Android.
 * 
 * Response from Restore Purchases method.
 */
export interface RestorePurchase {
  subscriptions: Array<ApphudSubscription>;
  purchases: Array<ApphudNonRenewingPurchase>;
  error: any;
}

/**
 * Available on iOS and Android.
 * 
 * Paywall object from Apphud Dashboard > Product Hub > Paywalls.
 */
export interface ApphudPaywall {
  /**
   * Paywall identifier from Apphud Dashboard > Product Hub > Paywalls.
   */
  identifier: string;

  /**
   * A/B experiment name, if any.
   */
  experimentName?: string;

  /**
   * Custom JSON data from Paywall.
   */
  json?: string;

  /**
   * Array of products from Paywall.
   */
  products: Array<ApphudProduct>;
}

/**
 * Available on iOS and Android.
 */
export interface ApphudProduct {
  /** Product identifier */
  id: string;

  /** Product name */
  name?: string;

  /** app_store or google_play */
  store: string;

  /** Paywall Identifier */
  paywallIdentifier?: string;

  /* iOS and Android. 

  For Android subscriptions, it returns a price for a first base plan. 
  Do not use this property if you have multiple base plans per subscription, get price from `subscriptionOffers` instead.
  */
  price?: number;

  /** Available on iOS only */
  localizeTitle?: string;
  priceLocale?: {
    currencySymbol: string;
    currencyCode: string;
    countryCode: string;
  };
  subscriptionPeriod?: {
    numberOfUnits: number;
    unit: number;
  };
  introductoryPrice?: {
    price: number;
    numberOfPeriods: number;
    subscriptionPeriod: {
      numberOfUnits: number;
      unit: number;
    };
    paymentMode: number;
  }
  
  /** Available on Android only */
  title?: string;
  productType?: string;
  subscriptionPeriodAndroid?: string;
  subscriptionOffers?: Array<ApphudSubscriptionOffer>;
  oneTimePurchaseOffer?: ApphudPricingPhase;
}

/** Available on Android only 
 * 
 * Pricing phase of subscription offer of `ProductDetails` object.
*/
export interface ApphudPricingPhase {
  price: number;
  priceCurrencyCode: string;
  billingCycleCount?: number;
  recurrenceMode?: number;
  formattedPrice: string;
}

/** 
 * Available on Android only.
 * 
 * Subscription offer of `ProductDetails` object.
 */
export interface ApphudSubscriptionOffer {
  offerToken: string;
  basePlanId: string;
  offerId?: string;
  pricingPhases: Array<ApphudPricingPhase>;
}

/** Available Attribution Providers */
export enum ApphudAttributionProvider {
  AppsFlyer = 'appsFlyer',
  Adjust = 'adjust',
  // AppleSearchAds = 'appleSearchAds', // use 'collectAppleSearchAdsAttribution' method instead.
  Firebase = 'firebase'
}

/**
 * Interface for submitting attribution data to Apphud from your attribution network provider.
 */
export interface AttributionProperties {
  data?: any;
  identifier: string;
  attributionProviderId: ApphudAttributionProvider
}

/** 
 * Platform reserved user properties.
 */
export enum ApphudUserPropertyKey {
  Age = '$age',
  Email = '$email',
  Name = '$name',
  Cohort = '$cohort',
  Gender = '$gender',
  Phone = '$phone',
}