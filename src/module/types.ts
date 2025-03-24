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

/**
 * Status of the subscription. It can only be in one state at any moment.
 */
export enum ApphudSubscriptionStatus {
  /**
   * Free trial period
   */
  trial = 'trial',

  /**
   * One of introductory offers: "Pay as you go" or "Pay up front".
   */
  intro = 'intro',

  /**
   * Custom promotional offer.
   */
  promo = 'promo',

  /**
   * Regular paid subscription.
   */
  regular = 'regular',

  /**
   * Custom grace period. Configurable in web.
   */
  grace = 'grace',

  /**
   * Subscription was refunded by Apple Care. Developer should treat this subscription as never purchased.
   */
  refunded = 'refunded',

  /**
   * Subscription has expired because has been canceled manually by user or had unresolved billing issues.
   */
  expired = 'expired',

  /**
   * Available on Android onlu
   */
  none = 'none',
}

export enum ApphudKind {
  autorenewable = 'autorenewable',
  nonrenewable = 'nonrenewable',
  none = 'none',
}

export interface ApphudSubscription {
  /**
   * Use this value to detect whether to give or not premium content to the user.
   * @returns: `true` when user should have access to premium content. Otherwise `false`.
   */
  isActive: boolean;

  /**
   * Status of the subscription. It can only be in one state at any moment.
   */
  status: ApphudSubscriptionStatus;

  /**
   * Product identifier of this subscription
   */
  productId: string;

  /**
   * Expiration date of subscription period.
   * You shouldn't use this property to detect if subscription is active because user can change system date in iOS settings.
   * Check isActive() method instead.
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
   * Purchase Token
   * Available on Android
   */
  purchaseToken?: string;

  /**
   * Returns `true` if subscription is made in test environment, i.e. sandbox or local purchase.
   * Available on iOS
   */
  isSandbox?: boolean;

  /**
   * Returns `true` if subscription was made using Local StoreKit Configuration File. Read more: https://docs.apphud.com/docs/testing-troubleshooting#local-storekit-testing
   * Available on iOS
   */
  isLocal?: boolean;

  /**
   * Subscriptiona has failed to renew, but Apple / Google will try to charge the user later.
   */
  isInRetryBilling: boolean;

  /**
   * False value means that user has canceled the subscription from App Store / Google Play settings.
   */
  isAutoRenewEnabled: boolean;

  /**
   * Available on iOS
   */
  kind?: ApphudKind;

  /**
   * Available on Android
   */
  groupId?: string;

  /**
   * True value means that user has already used introductory offer for this subscription
   * (free trial, pay as you go or pay up front).
   */
  isIntroductoryActivated: boolean;
}

export interface ApphudNonRenewingPurchase {
  /**
   * Product identifier of this purchase
   */
  productId: string;

  /**
   * Date when user bought regular in-app purchase. Timestamp in seconds.
   */
  purchasedAt: number;

  /**
   * Date when the purchase has been refunded. Timestamp in seconds.
   */
  canceledAt?: number;

  /**
   * Purchase Token
   * Available on Android
   */
  purchaseToken?: string;

  /**
   * Returns true if purchase was consumed
   * Available on Android
   */
  isConsumable?: boolean;

  /**
   * Returns `true` if purchase was made using Local StoreKit Configuration File. Read more: https://docs.apphud.com/docs/testing-troubleshooting#local-storekit-testing
   */
  isLocal?: boolean;

  /**
   * Returns `true` if purchase is not refunded.
   */
  isActive: boolean;
}

export interface ApphudPurchaseResult {
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
  purchase?: {
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
  transaction?: {
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
  json?: Record<string, any>;

  /**
   * Array of products from Paywall.
   */
  products: ApphudProduct[];
}

/**
 * Available on iOS
 */
export interface SKProduct {
  localizedTitle?: string;
  priceLocale: {
    currencySymbol: string;
    currencyCode: string;
    countryCode: string;
  };

  price: number;

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
}

/**
 * Available on Android
 */
export interface ProductDetails {
  id: string;
  productType: string;
  store: string;
  title: string;
  subscriptionPeriod: string;
  subscriptionOffers: ApphudSubscriptionOffer[];
  oneTimePurchaseOffer?: ApphudPricingPhase;
  price?: number;
}

/**
 * Available on iOS and Android.
 */
export interface ApphudProduct {
  /** Product identifier */
  productId: string;

  /** Product name */
  name?: string;

  /** app_store or google_play */
  store: string;

  /**
   * Base Plan Id of the product from Google Play Console
   *
   * Available on Android
   */
  basePlanId?: string;

  /**
   * Available on iOS
   */
  skProduct?: SKProduct;

  /**
   * When paywalls are successfully loaded, productDetails model will always be present if Google Play returned model for this product id. getPaywalls method will return callback only when Google Play products are fetched and mapped with Apphud products. May be null if product identifier is invalid, or product is not available in Google Play
   *
   * Available on Android
   */
  productDetails?: ProductDetails;

  /** Paywall Identifier */
  paywallIdentifier?: string;
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
