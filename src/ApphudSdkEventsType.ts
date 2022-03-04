export enum ApphudSdkEmitterEvents {
  apphudDidFetchStoreKitProducts = 'apphudDidFetchStoreKitProducts',
  apphudDidChangeUserID = 'apphudDidChangeUserID',
  apphudSubscriptionsUpdated = 'apphudSubscriptionsUpdated',
  apphudNonRenewingPurchasesUpdated = 'apphudNonRenewingPurchasesUpdated',
  apphudDidPurchase = 'apphudDidPurchase',
  apphudWillPurchase = 'apphudWillPurchase',
  apphudDidFailPurchase = 'apphudDidFailPurchase',
  apphudDidSelectSurveyAnswer = 'apphudDidSelectSurveyAnswer',
  productFetchCallback = 'productFetchCallback',
}

export type ApphudSdkEventsType = {
  setApphudProductIdentifiers(ids: Array<string>): Promise<any>;
};
