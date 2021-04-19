import { NativeEventEmitter, NativeModules } from 'react-native';
import type { ApphudSdkType } from './ApphudSdkType';
import type { ApphudSdkEventsType } from './ApphudSdkEventsType';

const { ApphudSdk, ApphudSdkEvents: _ApphudSdkEvents } = NativeModules;

export const ApphudSdkEventEmitter = new NativeEventEmitter(_ApphudSdkEvents);

export const ApphudSdkEvents = _ApphudSdkEvents as ApphudSdkEventsType;

export default ApphudSdk as ApphudSdkType;

export * from './ApphudSdkType';

export * from './ApphudSdkEventsType';
