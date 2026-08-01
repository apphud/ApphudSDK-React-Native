import React, { type ReactElement } from 'react';
import {
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type ViewStyle,
  type ViewProps,
} from 'react-native';
import {
  type ApphudProduct,
  type ApphudPurchaseResult,
  type PlacementsOptions,
} from '../module';
import NativePaywallScreenView, {
  Commands,
  type NativeProps,
} from '../specs/PaywallScreenViewNativeComponent';
import { LoadingContent } from './LoadingContent';
import { ErrorContent } from './ErrorContent';
import { type LoadingViewError } from './types';

/**
 * Event object as the generated component declares it. Derived from the spec
 * so the handlers stay assignable regardless of which React Native type
 * flavour (legacy or strict) is active in the consuming project.
 */
type NativeEventKey =
  | 'onStartLoading'
  | 'onReceiveView'
  | 'onLoadingError'
  | 'onTransactionStarted'
  | 'onTransactionCompleted'
  | 'onCloseButtonTapped';

type NativeEventOf<Key extends NativeEventKey> = Parameters<
  Extract<NonNullable<NativeProps[Key]>, (...args: any) => any>
>[0];

type Props = ViewProps & {
  /**
   * Paywall placement identifier.
   * Determines which paywall configuration should be displayed.
   */
  placementIdentifier: string;

  /**
   * Options for requesting placements, such as retry attempts and force refresh.
   * This prop is optional and can be used to customize the behavior of placement requests.
   * If not provided, default options will be used.
   *
   * Use as const or use the `useMemo` (`useRef`) hook for remove rerendering on every render due to object reference change.
   *
   * Example usage:
   * ```tsx
   * const REQUEST_PLACEMENTS_OPTIONS = { maxAttempts: 4, forceRefresh: true };
   *
   * <PaywallScreenView
   *   placementIdentifier={placementId}
   *   requestPlacementsOptions={REQUEST_PLACEMENTS_OPTIONS}
   * />
   * ```
   */
  requestPlacementsOptions?: Partial<PlacementsOptions>;

  /**
   * Called when the paywall starts loading.
   */
  onStartLoading?: (
    event: NativeSyntheticEvent<{ placementIdentifier: string }>
  ) => void;

  /**
   * Called when the native paywall view is fully received and rendered.
   */
  onReceiveView?: (event: NativeSyntheticEvent<{}>) => void;

  /**
   * Called when an error occurs while loading the paywall.
   */
  onLoadingError?: (
    event: NativeSyntheticEvent<{
      placementIdentifier: string;
      error: LoadingViewError;
    }>
  ) => void;

  /**
   * Called when a purchase transaction starts.
   */
  onTransactionStarted?: (
    event: NativeSyntheticEvent<{ result: ApphudProduct | null }>
  ) => void;

  /**
   * Called when a purchase transaction completes.
   */
  onTransactionCompleted?: (
    event: NativeSyntheticEvent<{ result: ApphudPurchaseResult | null }>
  ) => void;

  /**
   * Called when the user taps the close button.
   */
  onCloseButtonTapped?: (event: NativeSyntheticEvent<{}>) => void;

  /**
   * Style applied to the native view.
   */
  style?: ViewStyle;

  /**
   * Custom renderer for the loading state.
   */
  renderLoading?: () => ReactElement;

  /**
   * Custom renderer for the error state.
   */
  renderError?: (error: LoadingViewError, onReload: () => void) => ReactElement;
};

/**
 * Fabric event payloads cannot describe the nested Apphud entities, so the
 * native side encodes them as JSON. Decoding here keeps the component's public
 * callbacks unchanged.
 */
function decode<T>(value: string | null | undefined): T | null {
  if (value == null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function remapEvent<To>(
  event: object,
  nativeEvent: To
): NativeSyntheticEvent<To> {
  return {
    ...event,
    nativeEvent,
  } as unknown as NativeSyntheticEvent<To>;
}

/**
 * React component that displays a native paywall screen.
 * The way for usage - react-navigation screen (modal)
 *
 * This component:
 * - wraps the native paywall view
 * - manages loading and error overlay states
 * - provides default UI for loading and error states
 * - exposes lifecycle and purchase-related callbacks
 *
 * The paywall content itself is rendered natively.
 *
 * @example
 * ```tsx
 * <PaywallScreenView
 *   placementIdentifier={placementId}
 *   onTransactionCompleted={(event) => {
 *     console.log(event.nativeEvent.result);
 *   }}
 * />
 * ```
 */
export const PaywallScreenView: React.FC<Props> = ({
  onStartLoading,
  onLoadingError,
  onReceiveView,
  onTransactionStarted,
  onTransactionCompleted,
  style,
  renderLoading = () => <LoadingContent />,
  renderError = (error: any, onReload: () => void) => (
    <ErrorContent error={error} onReload={onReload} />
  ),
  ...props
}) => {
  const nativeView = React.useRef<React.ComponentRef<
    typeof NativePaywallScreenView
  > | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<LoadingViewError | null>(null);

  const commonStyles = StyleSheet.compose(
    [innerStyles.flex, innerStyles.background],
    style
  );

  const reload = React.useCallback(() => {
    if (nativeView.current == null) {
      return;
    }

    Commands.reload(nativeView.current);
  }, []);

  const _onStartLoading = React.useCallback(
    (event: NativeEventOf<'onStartLoading'>) => {
      setIsLoading(true);
      setError(null);
      onStartLoading?.(
        remapEvent(event, {
          placementIdentifier: event.nativeEvent.placementIdentifier,
        })
      );
    },
    [onStartLoading]
  );

  const _onLoadingError = React.useCallback(
    (event: NativeEventOf<'onLoadingError'>) => {
      const decoded = decode<LoadingViewError>(event.nativeEvent.error);

      setIsLoading(false);
      setError(decoded);
      onLoadingError?.(
        remapEvent(event, {
          placementIdentifier: event.nativeEvent.placementIdentifier,
          error: decoded as LoadingViewError,
        })
      );
    },
    [onLoadingError]
  );

  const _onReceiveView = React.useCallback(
    (event: NativeEventOf<'onReceiveView'>) => {
      setIsLoading(false);
      onReceiveView?.(remapEvent(event, {}));
    },
    [onReceiveView]
  );

  const _onTransactionStarted = React.useCallback(
    (event: NativeEventOf<'onTransactionStarted'>) => {
      onTransactionStarted?.(
        remapEvent(event, {
          result: decode<ApphudProduct>(event.nativeEvent.result),
        })
      );
    },
    [onTransactionStarted]
  );

  const _onTransactionCompleted = React.useCallback(
    (event: NativeEventOf<'onTransactionCompleted'>) => {
      onTransactionCompleted?.(
        remapEvent(event, {
          result: decode<ApphudPurchaseResult>(event.nativeEvent.result),
        })
      );
    },
    [onTransactionCompleted]
  );

  return (
    <View style={commonStyles}>
      <NativePaywallScreenView
        ref={nativeView}
        style={innerStyles.flex}
        {...props}
        onStartLoading={_onStartLoading}
        onLoadingError={_onLoadingError}
        onReceiveView={_onReceiveView}
        onTransactionStarted={_onTransactionStarted}
        onTransactionCompleted={_onTransactionCompleted}
      />
      {(isLoading || error !== null) && (
        <View style={[innerStyles.overload, innerStyles.background]}>
          {isLoading && renderLoading()}
          {error !== null && renderError(error, reload)}
        </View>
      )}
    </View>
  );
};

const innerStyles = StyleSheet.create({
  background: {
    backgroundColor: 'white',
  },
  flex: {
    flex: 1,
  },
  overload: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
