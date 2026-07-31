import type { ApphudProduct } from '../module';

export type ApphudPurchaseEventResult = {
  /**
   * product interface of iOS SKProduct.
   */
  product: ApphudProduct;
  /**
   * Promotional Offer Identifier, if any. Otherwise null.
   */
  offerId?: string;
  /**
   * The name of the Rules Screen.
   */
  screenName: string;
};

export type ApphudDidFailPurchaseEventResult = ApphudPurchaseEventResult & {
  /**
   * Error code. For example, code 2 [SKErrorPaymentCancelled] means that user canceled purchase
   */
  errorCode: number;
};

export type ApphudScreenDidAppearResult = {
  /**
   * The name of the Rules Screen
   */
  screenName: string;
};

/**
 * Indicates how a deep link attribution result was obtained.
 *
 * - `direct`: the user opened an actual deep link (App Link / Universal Link or custom scheme URL).
 * - `deferred`: attribution was resolved for the current installation without an explicit link,
 *   typically right after install.
 */
export type ApphudDeeplinkAttributionKind = 'direct' | 'deferred';

export type ApphudDeeplinkAttribution = {
  /**
   * The attribution data returned by Apphud. Empty when no match is found.
   */
  attribution: Record<string, unknown>;
  /**
   * Whether the attribution came from a direct link open or a deferred lookup.
   */
  kind: ApphudDeeplinkAttributionKind;
  /**
   * The original deep link URL for direct opens, or null for deferred attribution.
   */
  url?: string | null;
};

export type ApphudDidSelectSurveyAnswerResult = {
  /**
   * Question of the survey
   */
  question: string;
  /**
   * Answer the user provided
   */
  answer: string;
  /**
   * The name of the Rules Screen
   */
  screenName: string;
};
