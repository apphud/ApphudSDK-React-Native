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
   * Available on iOS and Android.
   * 
   * Set custom user property.
   * @param key -  You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param value - Value must be a number, string, boolean or null. Passing a null value removes the property.
   * @param setOnce - if true, the property will be set only once and then it won't be updated.
   */
  setUserProperty(key: ApphudUserPropertyKey | string, value: any, setOnce: boolean): void;

  /**
   * Available on iOS and Android.
   * 
   * Increment custom user property.
   * @param key - You can use custom string keys or built-in user property keys described in ApphudUserPropertyKey.
   * @param by - Value must be a number.
   */
  incrementUserProperty(key: ApphudUserPropertyKey | string, by: number): void;
  
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
};

export interface StartProperties {
  apiKey: string;
  userId?: string;
  deviceId?: string;
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
  status: string;
  productId: string;
  expiresAt: number;
  startedAt: number;
  canceledAt?: number;
  isInRetryBilling: boolean;
  isAutoRenewEnabled: boolean;
  isIntroductoryActivated: boolean;
  isActive: boolean;
}

export interface ApphudNonRenewingPurchase {
  productId: string;
  purchasedAt: string;
  canceledAt?: string;
  isActive: boolean;
}

export interface ApphudPurchaseResult {

  /* iOS and Android 
    Returns true if purchase was successful, false if not.
  */
  success: boolean

  /* iOS and Android: ApphudPurchaseResult class */
  subscription?: ApphudSubscription;
  nonRenewingPurchase?: ApphudNonRenewingPurchase;
  error?: {
    code: number;
    message: string;
  }

  // iOS and Android
  // returns true if user canceled purchase, othwerise not set
  userCanceled?: boolean;

  playStoreTransaction?: {
    /* Android: Purchase class */
    orderId: string;
    purchaseState: number;
    purchaseTime: number;
    purchaseToken: string;
  };

  appStoreTransaction?: {
    state: number;
    productId: string;
    // these two values present only if state is purchased or restored (1 or 3)
    id?: string;
    date?: number;
  };
}

export interface RestorePurchase {
  subscriptions: Array<ApphudSubscription>;
  purchases: Array<ApphudNonRenewingPurchase>;
  error: any;
}

export interface ApphudPaywall {
  identifier: string;
  experimentName?: string;
  json?: string;
  products: Array<ApphudProduct>;
}
export interface ApphudProduct {
  // Product ID: iOS and Android
  id: string;
  name?: string;
  store: string;
  paywallIdentifier?: string;

  /* iOS and Android. 

  For Android subscriptions, it returns a price for a first base plan. 
  Do not use this property if you have multiple base plans per subscription, get price from `subscriptionOffers` instead.
  */
  price?: number;

  /* iOS only */
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
  
  /* Android only */
  title?: string;
  productType?: string;
  subscriptionPeriodAndroid?: string;
  subscriptionOffers?: Array<ApphudSubscriptionOffer>;
  oneTimePurchaseOffer?: ApphudPricingPhase;
}

/* Android only */
export interface ApphudPricingPhase {
  price: number;
  priceCurrencyCode: string;
  billingCycleCount?: number;
  recurrenceMode?: number;
  formattedPrice: string;
}

/* Android only */
export interface ApphudSubscriptionOffer {
  offerToken: string;
  basePlanId: string;
  offerId?: string;
  pricingPhases: Array<ApphudPricingPhase>;
}

/* Attribution */
export enum ApphudAttributionProvider {
  AppsFlyer,
  Adjust,
  AppleSearchAds,
}

export interface AttributionProperties {
  data?: any;
  identifier: string;
  attributionProviderId: ApphudAttributionProvider
}

/* User Properties */
export enum ApphudUserPropertyKey {
  Age = '$age',
  Email = '$email',
  Name = '$name',
  Cohort = '$cohort',
  Gender = '$gender',
  Phone = '$phone',
}