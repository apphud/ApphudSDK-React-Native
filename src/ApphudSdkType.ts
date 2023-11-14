/*
Official Apphud SDK port for React Native.

*/
export type ApphudSdkType = {

  start(options: StartProperties): Promise<boolean>;
  startManually(options: StartProperties): Promise<boolean>;
  
  userId(): Promise<string>;

  paywalls(): Promise<Array<ApphudPaywall>>;
  products(): Promise<Array<ApphudProduct>>;

  hasPremiumAccess(): Promise<boolean>;
  hasActiveSubscription(): Promise<boolean>;

  purchase(props: ApphudPurchaseProps): Promise<ApphudPurchaseResult>;
  // CHECK
  restorePurchases(): Promise<RestorePurchase>;
    
  // Android only
  syncPurchasesInObserverMode(): Promise<boolean>;

  subscription(): Promise<ApphudSubscription>;
  subscriptions(): Promise<Array<ApphudSubscription>>;
  nonRenewingPurchases(): Promise<Array<ApphudNonRenewingPurchase>>;
  isNonRenewingPurchaseActive(productIdentifier: string): Promise<boolean>;

  addAttribution(options: AttributionProperties): Promise<boolean>;

  // CHECK
  setUserProperty(key: ApphudUserPropertyKey | string, value: string, setOnce: boolean): Promise<any>;
  incrementUserProperty(key: ApphudUserPropertyKey | string, by: string): Promise<any>;
  
  collectDeviceIdentifiers(): Promise<any>;
  logout(): Promise<boolean>;
  optOutOfTracking(): Promise<any>;
};

export interface StartProperties {
  apiKey: string;
  userId?: string;
  deviceId?: string;
  observerMode?: boolean;
}

export interface ApphudPurchaseProps {
  /* iOS and Android
    Identifier of the product you want to purchase, i.e. com.product.id
   */
  productId: string;

  /* iOS and Android
  Paywall ID from ApphudProduct object. 
  If you pass null, purchase won't be attached to it's paywall, which may result in incorrect analytics. 
  */
  paywallId?: string;

  /* Android only
    For Android, offer token is mandatory for purchasing subscriptions. 
  */
  offerToken?: string;

  /* Android only
    For one time purchases, specify whether the product is consumable or acknowledgable. 
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
  name: string;
  store: string;
  paywallIdentifier: string;

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
export enum IOSApphudAttributionProvider {
  AppsFlyer,
  Adjust,
  AppleSearchAds,
}

// CHECK ATTRIBUTION
export enum AndroidApphudAttributionProvider {
  appsFlyer = 'appsFlyer',
  adjust = 'adjust',
}

export interface AttributionProperties {
  data: any;
  identifier: string;
  attributionProviderId:
    | IOSApphudAttributionProvider
    | AndroidApphudAttributionProvider;
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