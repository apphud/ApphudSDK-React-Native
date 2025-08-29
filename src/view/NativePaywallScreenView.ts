import {
  requireNativeComponent,
  type NativeSyntheticEvent,
} from 'react-native';
import { type ApphudProduct } from '../module';

export const PaywallScreenView = requireNativeComponent<{
  placementIdentifier: string;
  onStartLoading?: (
    event: NativeSyntheticEvent<{ placementIdentifier: string }>
  ) => void;
  onReceiveView?: (event: NativeSyntheticEvent<{}>) => void;
  onLoadingError?: (
    event: NativeSyntheticEvent<{ placementIdentifier: string; error: any }>
  ) => void;
  onTransactionStarted?: (product: ApphudProduct | null) => void;
  onFinished?: () => void;
}>('PaywallScreenView');
