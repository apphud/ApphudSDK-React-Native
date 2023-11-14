export enum ApphudSdkEmitterEvents {
  paywallsDidFullyLoad = 'paywallsDidFullyLoad',
  apphudDidLoadStoreProducts = 'apphudDidLoadStoreProducts',
  apphudDidChangeUserID = 'apphudDidChangeUserID',
  apphudSubscriptionsUpdated = 'apphudSubscriptionsUpdated',
  apphudNonRenewingPurchasesUpdated = 'apphudNonRenewingPurchasesUpdated',

  apphudDidPurchase = 'apphudDidPurchase',
  apphudWillPurchase = 'apphudWillPurchase',
  apphudDidFailPurchase = 'apphudDidFailPurchase',
  apphudDidSelectSurveyAnswer = 'apphudDidSelectSurveyAnswer',
}

export type ApphudSdkEventsType = {
  setApphudProductIdentifiers(ids: Array<string>): Promise<any>;
};
