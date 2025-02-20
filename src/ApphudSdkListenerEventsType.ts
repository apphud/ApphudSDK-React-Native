/**
 *  List of events that can be emitted by Apphud SDK
 */
export enum ApphudSdkListenerEvents {
  /**
   * Called when paywalls are fully loaded with their `SKProducts` / `ProductDetails`.
   * @param paywalls - array of paywalls.
   *
   * Available on iOS and Android.
   */
  paywallsDidFullyLoad = 'paywallsDidFullyLoad',

  /**
   * Called when store products are loaded with their `SKProducts` / `ProductDetails`.
   * It's not recommended to use this event. Use `paywallsDidFullyLoad` instead.
   *
   * Available on iOS and Android.
   */
  apphudDidLoadStoreProducts = 'apphudDidLoadStoreProducts',

  /**
   * Called when user ID has been changed. Use this if you implement integrations with Analytics services.
   * @param userId - new user ID.
   *
   * Available on iOS and Android.
   */
  apphudDidChangeUserID = 'apphudDidChangeUserID',

  /**
   * Returns array of subscriptions that user ever purchased. Empty array means user never purchased a subscription.
   *
   * AVailable on iOS and Android.
   */
  apphudSubscriptionsUpdated = 'apphudSubscriptionsUpdated',

  /**
   * Called when any of non renewing purchases changes. Called when purchase is made or has been refunded.
   *
   * Available on iOS and Android.
   */
  apphudNonRenewingPurchasesUpdated = 'apphudNonRenewingPurchasesUpdated',

  /**
   * Called when a Rules Screen appeared.
   *
   * @param screenName - the name of the Rules Screen.
   *
   * Available on iOS only.
   */
  apphudScreenDidAppear = 'apphudScreenDidAppear',

  /**
   * Called when user successfully purchases in a Rules Screen.
   *
   * @param product - product interface of iOS SKProduct
   * @param offerId - Promotional Offer Identifier, if any. Otherwise null.
   * @param screenName - the name of the Rules Screen.
   *
   * Available on iOS only.
   */
  apphudDidPurchase = 'apphudDidPurchase',

  /**
   * Called when user is about to make purchase in a Rules Screen.
   *
   * @param product - product interface of iOS SKProduct
   * @param offerId - Promotional Offer Identifier, if any. Otherwise null.
   * @param screenName - the name of the Rules Screen.
   *
   * Available on iOS only.
   */
  apphudWillPurchase = 'apphudWillPurchase',

  /**
   * Called when user failed to make a purchase in a Rules Screen.
   *
   * @param product - product interface of iOS SKProduct
   * @param offerId - Promotional Offer Identifier, if any. Otherwise null.
   * @param screenName - the name of the Rules Screen.
   * @param errorCode - error code. For example, code 2 [SKErrorPaymentCancelled] means that user canceled purchase.
   *
   * Available on iOS only.
   */
  apphudDidFailPurchase = 'apphudDidFailPurchase',

  /**
   * Called when user answers a survey in a Rules Screen.
   *
   * @param question - Question of the survey
   * @param answer - Answer the user provided.
   * @param screenName - the name of the Rules Screen.
   *
   * Available on iOS only.
   */
  apphudDidSelectSurveyAnswer = 'apphudDidSelectSurveyAnswer',
}

export type ApphudSdkListenerEventsType = {
  /**
   * Specify a list of product identifiers to fetch from the App Store.
   * @param ids array of product identifiers
   * If you don't implement this method or return empty array,
   * then product identifiers will be fetched from Apphud servers.
   * Implementing this delegate method gives you more reliabality on fetching products
   *  and a little more speed on loading due to skipping Apphud request,
   * but also gives less flexibility because you have to hardcode product identifiers this way.
   *
   * Available on iOS only.
   */
  setApphudProductIdentifiers(ids: Array<string>): Promise<any>;
};
