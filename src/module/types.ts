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
   * Offer token is for purchasing subscriptions on Android. If not passed, then SDK will fallback to the first available one.
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
  success: boolean;

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
  };

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
   * A/B Experiment Variation Name
   */
  variationName?: string;

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
  };

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
  AppleSearchAds = 'appleSearchAds', // iOS only
  Firebase = 'firebase',
}

/**
 * Interface for submitting attribution data to Apphud from your attribution network provider.
 */
export interface AttributionProperties {
  data?: any;
  identifier: string;
  attributionProviderId: ApphudAttributionProvider;
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

export interface ApphudWebRestoreResult {
  /**
      Returns true if found a user with given email or Apphud User ID.
    */
  result: boolean;

  /**
      Apphud User ID.
    */
  user_id?: string;

  /**
       Returns `true` if user has premium access.
    */
  is_premium: boolean;
}

/**
 * Properties for apphud user
 */
export interface ApphudUser {
  /**
   * Unique user identifier. This can be updated later
   */
  userId: string;
  /**
   * An array of subscriptions of any statuses that user has ever purchased.
   */
  subscriptions: ApphudSubscription[];
  /**
   * An array of non-renewing purchases of any statuses that user has ever purchased.
   */
  purchases: ApphudNonRenewingPurchase[];
}

export interface ApphudPlacement {
  /**
     Placement identifier configured in Apphud Product Hub > Placements.
     */
  identifier: string;

  /**
      Represents the paywall linked with this specific Placement.
 
      Returns `nil` if no paywalls are enabled in the placement configuration or if the user doesn't meet the audience criteria.
     */
  paywall?: ApphudPaywall;

  /**
      A/B experiment name if it's paywall, if any.
      */
  experimentName?: String;
}

export interface Identifiers {
  /**
   * IDFA. Identifier for Advertisers. If you request IDFA using App Tracking Transparency framework, you can call this method again after granting access.
   */
  idfa: string;
  /**
   * IDFV. Identifier for Vendor. Can be passed right after SDK's `start` method.
   */
  idfv: string;
}
