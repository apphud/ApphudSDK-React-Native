import { NativeModules } from 'react-native';

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

export interface StartProperties {
  apiKey: string;
  userId?: string;
  deviceId?: string;
  observerMode?: boolean;
}

export interface AttributeProperties {
  data: any;
  identifier: string;
  attributionProviderId:
    | IOSApphudAttributionProvider
    | AndroidApphudAttributionProvider;
}

export interface ApphudSubscriptionStatus {
  productId: string;
  expiresDate: string;
  startedAt: string;
  canceledAt: string;
  isInRetryBilling: boolean;
  isAutorenewEnabled: boolean;
  isIntroductoryActivated: boolean;
}

export interface ApphudNonRenewingPurchase {
  productId: string;
  purchasedAt: string;
  canceledAt: string;
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
  subscription?: ApphudSubscriptionStatus;
  nonRenewingPurchase?: ApphudNonRenewingPurchase;
  transaction?: object;
  error?: any;
}

export interface ApphudSubscription {
  status: string;
  productId: string;
  expiresAt: string;
  startedAt: string;
  cancelledAt: string;
  isInRetryBilling: Boolean;
  isAutoRenewEnabled: Boolean;
  isIntroductoryActivated: Boolean;
  isActive: Boolean;
  kind: string;
}

export interface ApphudNonRenewingPurchase {
  productId: string;
  purchasedAt: string;
  canceledAt: string;
}

export interface RestorePurchase {
  subscriptions: Array<ApphudSubscriptionStatus>;
  purchases: Array<PurchaseResponse>;
  error: any;
}

export interface ApphudProduct {
  id: string;
  price: string;
  regionCode: string;
  currencyCode?: string;
}

type ApphudSdkType = {
  start(options: StartProperties): Promise<boolean>;
  startManually(options: StartProperties): Promise<boolean>;
  logout(): Promise<boolean>;
  hasActiveSubscription(): Promise<boolean>;
  products(): Promise<Array<ApphudProduct>>;
  subscription(): Promise<ApphudSubscriptionStatus>;
  subscriptions(): Promise<Array<ApphudSubscription>>;
  purchase(productIdentifier: string): Promise<PurchaseResponse>;
  isNonRenewingPurchaseActive(productIdentifier: string): Promise<boolean>;
  nonRenewingPurchases(): Promise<ApphudNonRenewingPurchase>;
  restorePurchases(): Promise<RestorePurchase>;
  syncPurchases(): Promise<boolean>;
  addAttribution(options: AttributeProperties): Promise<boolean>;
  userId(): Promise<string>;
};

const { ApphudSdk } = NativeModules;

export default ApphudSdk as ApphudSdkType;
