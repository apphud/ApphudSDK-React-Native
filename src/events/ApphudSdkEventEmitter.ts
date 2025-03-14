import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type {
  ApphudPaywall,
  ApphudProduct,
  ApphudSubscription,
  ApphudNonRenewingPurchase,
} from '../module';
import type {
  ApphudPurchaseEventResult,
  ApphudDidFailPurchaseEventResult,
  ApphudScreenDidAppearResult,
  ApphudDidSelectSurveyAnswerResult,
} from './types';

const { ApphudSdkEvents } = NativeModules;

if (!ApphudSdkEvents && __DEV__) {
  console.error(
    'NativeModule "ApphudSdkEvents" is not linked. Make sure to run pod install on iOS and rebuild your app'
  );
}

type ApphudSdkListenerEvent =
  | 'paywallsDidFullyLoad'
  | 'apphudDidLoadStoreProducts'
  | 'apphudDidChangeUserID'
  | 'apphudSubscriptionsUpdated'
  | 'apphudNonRenewingPurchasesUpdated'
  | 'apphudScreenDidAppear'
  | 'apphudDidPurchase'
  | 'apphudWillPurchase'
  | 'apphudDidFailPurchase'
  | 'apphudDidSelectSurveyAnswer';

const emitter = new NativeEventEmitter(ApphudSdkEvents);

type Callback<Arg = void> = Arg extends void ? () => void : (arg: Arg) => void;

function makeSubscriberMethod<T extends Callback<any>>(
  eventName: ApphudSdkListenerEvent
): (cb: T) => Callback {
  return (cb: T) => {
    const subscription = emitter.addListener(eventName, cb);

    return () => subscription.remove();
  };
}

interface IApphudSdkEventEmitter {
  /**
   *
   * Called when paywalls are fully loaded with their `SKProducts` / `ProductDetails`. Returns callback for unsubsribe.
   *
   * Available on iOS and Android.
   *
   * @param {Callback<ApphudPaywall[]>} cb - Callback which will invoke on event whith ApphudPaywall[] arg.
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onPaywallsDidFullyLoad(cb: Callback<ApphudPaywall[]>): Callback;

  /**
   * Called when store products are loaded with their `SKProducts` / `ProductDetails`.
   * It's not recommended to use this event. Use `paywallsDidFullyLoad` instead.
   *
   * Available on iOS and Android.
   *
   * @param {Callback<ApphudProduct[]>} cb - Callback which will invoke on event whith ApphudProduct[] arg.
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudDidLoadStoreProducts(cb: Callback<ApphudProduct[]>): Callback;

  /**
   * Called when user ID has been changed. Use this if you implement integrations with Analytics services.
   *
   *  Available on iOS and Android.
   *
   * @param {Callback<string>} cb - Callback which will invoke on event whith new userID string arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudDidChangeUserID(cb: Callback<string>): Callback;

  /**
   * Returns array of subscriptions that user ever purchased. Empty array means user never purchased a subscription.
   *
   * AVailable on iOS and Android.
   *
   * @param {Callback<ApphudSubscription[]>} cb - Callback which will invoke on event whith ApphudSubscription[] arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudSubscriptionsUpdated(cb: Callback<ApphudSubscription[]>): Callback;

  /**
   * Called when any of non renewing purchases changes. Called when purchase is made or has been refunded.
   *
   * Available on iOS and Android.
   *
   * @param {Callback<ApphudNonRenewingPurchase[]>} cb - Callback which will invoke on event whith ApphudNonRenewingPurchase[] arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudNonRenewingPurchasesUpdated(
    cb: Callback<ApphudNonRenewingPurchase[]>
  ): Callback;

  /**
   * Called when a Rules Screen appeared.
   *
   * Available on iOS only.
   *
   * @param {Callback<ApphudScreenDidAppearResult>} cb - Callback which will invoke on event whith ApphudScreenDidAppearResult arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudScreenDidAppear(cb: Callback<ApphudScreenDidAppearResult>): Callback;

  /**
   * Called when user successfully purchases in a Rules Screen.
   *
   * Available on iOS only.
   *
   * @param {Callback<ApphudPurchaseEventResult>} cb - Callback which will invoke on event whith ApphudPurchaseEventResult arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudDidPurchase(cb: Callback<ApphudPurchaseEventResult>): Callback;

  /**
   * Called when user is about to make purchase in a Rules Screen.
   *
   * Available on iOS only.
   *
   * @param {Callback<ApphudPurchaseEventResult>} cb - Callback which will invoke on event whith ApphudPurchaseEventResult arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudWillPurchase(cb: Callback<ApphudPurchaseEventResult>): Callback;

  /**
   * Called when user failed to make a purchase in a Rules Screen.
   *
   * Available on iOS only.
   *
   * @param {Callback<ApphudDidFailPurchaseEventResult>} cb - Callback which will invoke on event whith ApphudDidFailPurchaseEventResult arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudDidFailPurchase(
    cb: Callback<ApphudDidFailPurchaseEventResult>
  ): Callback;

  /**
   * Called when user answers a survey in a Rules Screen.
   *
   * Available on iOS only.
   *
   * @param {Callback<ApphudDidSelectSurveyAnswerResult>} cb - Callback which will invoke on event whith ApphudDidSelectSurveyAnswerResult arg
   *
   * @returns {Callback} cb for unsubscribe
   *
   */
  onApphudDidSelectSurveyAnswer(
    cb: Callback<ApphudDidSelectSurveyAnswerResult>
  ): Callback;

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
  setApphudProductIdentifiers(ids: string[]): Promise<string[]>;
}

export const ApphudSdkEventEmitter: IApphudSdkEventEmitter = {
  onPaywallsDidFullyLoad: makeSubscriberMethod('paywallsDidFullyLoad'),

  onApphudDidLoadStoreProducts: makeSubscriberMethod(
    'apphudDidLoadStoreProducts'
  ),

  onApphudDidChangeUserID: makeSubscriberMethod('apphudDidChangeUserID'),

  onApphudSubscriptionsUpdated: makeSubscriberMethod(
    'apphudSubscriptionsUpdated'
  ),

  onApphudNonRenewingPurchasesUpdated: makeSubscriberMethod(
    'apphudNonRenewingPurchasesUpdated'
  ),

  onApphudScreenDidAppear: makeSubscriberMethod('apphudScreenDidAppear'),

  onApphudDidPurchase: makeSubscriberMethod('apphudDidPurchase'),

  onApphudWillPurchase: makeSubscriberMethod('apphudWillPurchase'),

  onApphudDidFailPurchase: makeSubscriberMethod('apphudDidFailPurchase'),

  onApphudDidSelectSurveyAnswer: makeSubscriberMethod(
    'apphudDidSelectSurveyAnswer'
  ),

  setApphudProductIdentifiers: Platform.select({
    ios: ApphudSdkEvents.setApphudProductIdentifiers,
    default: () =>
      Promise.reject(
        'ApphudSdkEvents.setApphudProductIdentifiers supports only iOS platform'
      ),
  }),
};
