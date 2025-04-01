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
