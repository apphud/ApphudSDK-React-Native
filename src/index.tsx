import { NativeEventEmitter, NativeModules } from 'react-native';
import type { ApphudSdkType } from './ApphudSdkType';
import type { ApphudSdkEventsType } from './ApphudSdkEventsType';
import { ApphudSdkListenerEvents } from './ApphudSdkEventsType';

const { ApphudSdk, ApphudSdkEvents: _ApphudSdkEvents } = NativeModules;

export const ApphudSdkEventEmitter = new NativeEventEmitter(_ApphudSdkEvents);

export const ApphudSdkEvents = _ApphudSdkEvents as ApphudSdkEventsType;

export default ApphudSdk as ApphudSdkType;

export * from './ApphudSdkType';

export * from './ApphudSdkEventsType';


const eventSubscription0 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.paywallsDidFullyLoad, (prds) => {
    console.log('Received event paywallsDidFullyLoad:', prds);
  });
  const eventSubscription1 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidSelectSurveyAnswer, (prds) => {
    console.log('Received event apphudDidSelectSurveyAnswer:', prds);
  });
  const eventSubscription2 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidFailPurchase, (prds) => {
    console.log('Received event apphudDidFailPurchase:', prds);
  });
  const eventSubscription3 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudDidPurchase, (prds) => {
    console.log('Received event apphudDidPurchase:', prds);
  });
  const eventSubscription4 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudWillPurchase, (prds) => {
    console.log('Received event apphudWillPurchase:', prds);
  });

  const eventSubscription5 = ApphudSdkEventEmitter.addListener(ApphudSdkListenerEvents.apphudScreenDidAppear, (prds) => {
    console.log('Received event apphudScreenDidAppear:', prds);
  });