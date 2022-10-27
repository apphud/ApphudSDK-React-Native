export enum IOSApphudAttributionProvider {
  AppsFlyer,
  Adjust,
  Facebook,
  AppleSearchAds,
}

export enum AndroidApphudAttributionProvider {
  appsFlyer = 'appsFlyer',
  adjust = 'adjust',
  facebook = 'facebook',
}

export enum ApphudUserPropertyKey {
  Age = '$age',
  Email = '$email',
  Name = '$name',
  Cohort = '$cohort',
  Gender = '$gender',
  Phone = '$phone',
}

export interface StartProperties {
  apiKey: string;
  userId?: string;
  deviceId?: string;
  observerMode?: boolean;
}

export interface AttributionProperties {
  data: any;
  identifier: string;
  attributionProviderId:
    | IOSApphudAttributionProvider
    | AndroidApphudAttributionProvider;
}

export interface ApphudNonRenewingPurchase {
  productId: string;
  purchasedAt: string;
  canceledAt?: string;
  isLocal: string;
  isSandbox: string;
}

export interface PurchaseResponse {
  /* Android: Purchase class */
  orderId?: string;
  originalJson?: string;
  packageName?: string;
  purchaseState?: number;
  purchaseTime?: number;
  purchaseToken?: string;
  signature?: string;
  sku?: string;

  /* iOS: ApphudPurchaseResult class */
  subscription?: ApphudSubscription;
  nonRenewingPurchase?: ApphudNonRenewingPurchase;
  transaction?: object;
  error?: any;
}

export interface ApphudSubscription {
  status: string;
  productId: string;
  expiresAt: string;
  startedAt: string;
  cancelledAt?: string;
  isInRetryBilling: Boolean;
  isAutoRenewEnabled: Boolean;
  isIntroductoryActivated: Boolean;
  isActive: Boolean;
  kind: string;
}

export interface RestorePurchase {
  subscriptions: Array<ApphudSubscription>;
  purchases: Array<PurchaseResponse>;
  error: any;
}

export interface ApphudProduct {
  id: string;
  price: string;
  localizeTitle?: string;
  localizedDescription?: string;
  priceLocale?: {
    currencySymbol: string;
    currencyCode: string;
    countryCode: string;
  };
  subscriptionPeriod?: any;
  introductoryPrice?: any;
  regionCode?: string;
  currencyCode?: string;
  description?: string;
  freeTrialPeriod?: string;
  introductoryPriceAmountMicros?: number;
  introductoryPriceCycles?: number;
  introductoryPricePeriod?: string;
  priceAmountMicros?: number;
  priceCurrencyCode?: string;
  title?: string;
  originalPrice?: string;
  type?: string;
  originalPriceAmountMicros?: string;
}

export type ApphudSdkType = {
  start(options: StartProperties): Promise<boolean>;
  startManually(options: StartProperties): Promise<boolean>;
  logout(): Promise<boolean>;
  hasActiveSubscription(): Promise<boolean>;
  products(): Promise<Array<ApphudProduct>>;
  subscription(): Promise<ApphudSubscription>;
  subscriptions(): Promise<Array<ApphudSubscription>>;
  purchase(productIdentifier: string): Promise<PurchaseResponse>;
  isNonRenewingPurchaseActive(productIdentifier: string): Promise<boolean>;
  nonRenewingPurchases(): Promise<ApphudNonRenewingPurchase>;
  restorePurchases(): Promise<RestorePurchase>;
  syncPurchases(): Promise<boolean>;
  addAttribution(options: AttributionProperties): Promise<boolean>;
  userId(): Promise<string>;
  setUserProperty(
    key: ApphudUserPropertyKey | String,
    value: string,
    setOnce: boolean
  ): Promise<any>;
  incrementUserProperty(
    key: ApphudUserPropertyKey | String,
    by: string
  ): Promise<any>;
};
