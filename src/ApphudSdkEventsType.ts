export enum ApphudSdkEmitterEvents {
  apphudDidFetchStoreKitProducts = 'apphudDidFetchStoreKitProducts',
  apphudDidChangeUserID = 'apphudDidChangeUserID',
  apphudSubscriptionsUpdated = 'apphudSubscriptionsUpdated',
  apphudNonRenewingPurchasesUpdated = 'apphudNonRenewingPurchasesUpdated',
}

export type ApphudSdkEventsType = {
  setApphudProductIdentifiers(ids: Array<string>): Promise<any>;
};
