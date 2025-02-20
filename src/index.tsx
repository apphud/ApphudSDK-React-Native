import { NativeEventEmitter, NativeModules } from 'react-native';

import type { ApphudSdkListenerEventsType } from './ApphudSdkListenerEventsType';
import type { ApphudSdkType } from './ApphudSdkType';

const { ApphudSdk } = NativeModules;
const { ApphudSdkEvents: _ApphudSdkEvents } = NativeModules;

export const ApphudSdkEventEmitter = new NativeEventEmitter(_ApphudSdkEvents);
export const ApphudSdkEvents = _ApphudSdkEvents as ApphudSdkListenerEventsType;
export default ApphudSdk as ApphudSdkType;

/**
 * See ApphudSDKType.ts for more information
 * See ApphudSDKListenerEventsType.ts for more information
 */

export * from './ApphudSdkType';
export * from './ApphudSdkListenerEventsType';

/** Uncomment to listen to events
ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.paywallsDidFullyLoad, (prds) => {
    console.log('Received event paywallsDidFullyLoad:', prds);
  });
  ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidSelectSurveyAnswer, (prds) => {
    console.log('Received event apphudDidSelectSurveyAnswer:', prds);
  });
  ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidFailPurchase, (prds) => {
    console.log('Received event apphudDidFailPurchase:', prds);
  });
  ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidPurchase, (prds) => {
    console.log('Received event apphudDidPurchase:', prds);
  });
  ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudWillPurchase, (prds) => {
    console.log('Received event apphudWillPurchase:', prds);
  });

  ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudScreenDidAppear, (prds) => {
    console.log('Received event apphudScreenDidAppear:', prds);
  });

  */
