import { codegenNativeCommands, codegenNativeComponent } from 'react-native';
import type * as React from 'react';
import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';

/**
 * Codegen spec for the native `PaywallScreenView` Fabric component.
 *
 * Fabric event payloads only support statically described types, so the
 * Apphud entities (`ApphudProduct`, `ApphudPurchaseResult`, the loading error)
 * travel as JSON strings and are decoded by the `PaywallScreenView` wrapper in
 * `src/view/PaywallScreenView.tsx`. The public component API is unchanged.
 */
export interface NativeProps extends ViewProps {
  placementIdentifier?: string;

  requestPlacementsOptions?: Readonly<{
    maxAttempts?: CodegenTypes.Int32;
    forceRefresh?: boolean;
    preferredTimeout?: CodegenTypes.Double;
  }>;

  onStartLoading?: CodegenTypes.DirectEventHandler<
    Readonly<{ placementIdentifier: string }>
  >;

  onReceiveView?: CodegenTypes.DirectEventHandler<Readonly<{}>>;

  /** `error` is a JSON-encoded `LoadingViewError`. */
  onLoadingError?: CodegenTypes.DirectEventHandler<
    Readonly<{ placementIdentifier: string; error: string }>
  >;

  /** `result` is a JSON-encoded `ApphudProduct`, or `null`. */
  onTransactionStarted?: CodegenTypes.DirectEventHandler<
    Readonly<{ result: string | null }>
  >;

  /** `result` is a JSON-encoded `ApphudPurchaseResult`, or `null`. */
  onTransactionCompleted?: CodegenTypes.DirectEventHandler<
    Readonly<{ result: string | null }>
  >;

  onCloseButtonTapped?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export type PaywallScreenViewType = HostComponent<NativeProps>;

interface NativeCommands {
  reload: (viewRef: React.ElementRef<PaywallScreenViewType>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['reload'],
});

export default codegenNativeComponent<NativeProps>('PaywallScreenView');
