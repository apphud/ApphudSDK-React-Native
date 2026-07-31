import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type {
  ApphudProduct,
  ApphudSubscription,
  ApphudNonRenewingPurchase,
  ApphudPlacement,
  ApphudUser,
} from '../module';
import type {
  ApphudPurchaseEventResult,
  ApphudDidFailPurchaseEventResult,
  ApphudScreenDidAppearResult,
  ApphudDidSelectSurveyAnswerResult,
  ApphudDeeplinkAttribution,
} from './types';

const { ApphudSdkEvents } = NativeModules;

if (!ApphudSdkEvents && __DEV__) {
  console.error(
    'NativeModule "ApphudSdkEvents" is not linked. Make sure to run pod install on iOS and rebuild your app'
  );
}

type ApphudSdkListenerEvent =
  | 'placementsDidFullyLoad'
  | 'userDidLoad'
  | 'apphudDidLoadStoreProducts'
  | 'apphudDidChangeUserID'
  | 'apphudSubscriptionsUpdated'
  | 'apphudNonRenewingPurchasesUpdated'
  | 'apphudScreenDidAppear'
  | 'apphudDidPurchase'
  | 'apphudWillPurchase'
  | 'apphudDidFailPurchase'
  | 'apphudDidSelectSurveyAnswer'
  | 'apphudDeeplinkAttribution';

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
   * Called when placements are fully loaded with their Paywalls and store products.
   *
   * Available on iOS and Android.
   */
  onPlacementsDidFullyLoad(cb: Callback<ApphudPlacement[]>): Callback;

  /**
   * Called once per app lifecycle when the user is registered or retrieved from cache.
   *
   * Available on iOS and Android.
   */
  onUserDidLoad(cb: Callback<ApphudUser>): Callback;

  /**
   * Called when store products are loaded with their `SKProducts` / `ProductDetails`.
   * It's not recommended to use this event. Use `onPlacementsDidFullyLoad` instead.
   *
   * Available on iOS and Android.
   */
  onApphudDidLoadStoreProducts(cb: Callback<ApphudProduct[]>): Callback;

  /**
   * Called when user ID has been changed. Use this if you implement integrations with Analytics services.
   *
   *  Available on iOS and Android.
   */
  onApphudDidChangeUserID(cb: Callback<string>): Callback;

  /**
   * Returns array of subscriptions that user ever purchased. Empty array means user never purchased a subscription.
   *
   * Available on iOS and Android.
   */
  onApphudSubscriptionsUpdated(cb: Callback<ApphudSubscription[]>): Callback;

  /**
   * Called when any of non renewing purchases changes. Called when purchase is made or has been refunded.
   *
   * Available on iOS and Android.
   */
  onApphudNonRenewingPurchasesUpdated(
    cb: Callback<ApphudNonRenewingPurchase[]>
  ): Callback;

  /**
   * Called when a Rules Screen appeared.
   *
   * Available on iOS only.
   */
  onApphudScreenDidAppear(cb: Callback<ApphudScreenDidAppearResult>): Callback;

  /**
   * Called when user successfully purchases in a Rules Screen.
   *
   * Available on iOS only.
   */
  onApphudDidPurchase(cb: Callback<ApphudPurchaseEventResult>): Callback;

  /**
   * Called when user is about to make purchase in a Rules Screen.
   *
   * Available on iOS only.
   */
  onApphudWillPurchase(cb: Callback<ApphudPurchaseEventResult>): Callback;

  /**
   * Called when user failed to make a purchase in a Rules Screen.
   *
   * Available on iOS only.
   */
  onApphudDidFailPurchase(
    cb: Callback<ApphudDidFailPurchaseEventResult>
  ): Callback;

  /**
   * Called when user answers a survey in a Rules Screen.
   *
   * Available on iOS only.
   */
  onApphudDidSelectSurveyAnswer(
    cb: Callback<ApphudDidSelectSurveyAnswerResult>
  ): Callback;

  /**
   * Called when deep link attribution is resolved, for both direct (link open) and
   * deferred (install) flows. May be called multiple times during the app lifecycle.
   * When no attribution match is found, `attribution` is an empty object.
   *
   * To receive `direct` attribution, forward incoming links to
   * `ApphudSdk.handleDeeplinkUrl(url)`. To request `deferred` attribution, call
   * `ApphudSdk.requestDeferredDeeplinkAttribution()`.
   *
   * Available on iOS and Android.
   */
  onApphudDeeplinkAttribution(
    cb: Callback<ApphudDeeplinkAttribution>
  ): Callback;

  /**
   * Specify a list of product identifiers to fetch from the App Store.
   *
   * Available on iOS only.
   */
  setApphudProductIdentifiers(ids: string[]): Promise<string[]>;
}

export const ApphudSdkEventEmitter: IApphudSdkEventEmitter = {
  onPlacementsDidFullyLoad: makeSubscriberMethod('placementsDidFullyLoad'),

  onUserDidLoad: makeSubscriberMethod('userDidLoad'),

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

  onApphudDeeplinkAttribution: makeSubscriberMethod(
    'apphudDeeplinkAttribution'
  ),

  setApphudProductIdentifiers: Platform.select({
    ios: ApphudSdkEvents.setApphudProductIdentifiers,
    default: () =>
      Promise.reject(
        'ApphudSdkEvents.setApphudProductIdentifiers supports only iOS platform'
      ),
  }),
};
