import type {
  ApphudProduct,
  ApphudPurchaseResult,
  IDisposable,
  PlacementsOptions,
} from './types';
import { type EventSubscription } from 'react-native';
import NativePaywallscreenPresenter, {
  type PresenterEvent,
} from '../specs/NativePaywallscreenPresenter';

/**
 * Options for displaying the paywall screen.
 */
export type Options = {
  /**
   * Paywall placement identifier.
   * Used by the native layer to determine screen configuration.
   */
  placementIdentifier: string;
} & PlacementsOptions;

/**
 * Internal counter used to generate unique identifiers
 * for PaywallScreenPresenter instances.
 */
let paywallScreenPresenterIdInternal = 0;

/**
 * List of event types that can be emitted by the paywall screen.
 */
const EVENT_TYPES = {
  /** Purchase transaction has started */
  TRANSACTION_STARTED: 'transactionStarted',

  /** Purchase transaction has completed successfully */
  TRANSACTION_COMPLETED: 'transactionCompleted',

  /** User tapped the close button */
  CLOSE_BUTTON_TAPPED: 'closeButtonTapped',

  /** An error occurred */
  ERROR: 'error',

  /** Paywall screen was shown */
  SCREEN_SHOWN: 'screenShown',
} as const;

/**
 * Callback signatures for each event type.
 * Used to provide strict typing for event subscriptions.
 */
type EventCallbacks = {
  /**
   * Transaction start event.
   * @param product The product being purchased, or null
   */
  [EVENT_TYPES.TRANSACTION_STARTED]: (product: ApphudProduct | null) => void;

  /**
   * Transaction completion event.
   * @param result Purchase result
   */
  [EVENT_TYPES.TRANSACTION_COMPLETED]: (result: ApphudPurchaseResult) => void;

  /**
   * Close button tap event.
   */
  [EVENT_TYPES.CLOSE_BUTTON_TAPPED]: () => void;

  /**
   * Error event.
   * @param error Error object
   */
  [EVENT_TYPES.ERROR]: (error: any) => void;

  /**
   * Screen shown event.
   */
  [EVENT_TYPES.SCREEN_SHOWN]: () => void;
};

/**
 * Native subscribers, keyed by the public event name.
 *
 * Codegen requires event payloads to be statically typed, so the native side
 * sends the body as a JSON string and it is decoded here.
 */
const NATIVE_SUBSCRIBERS: Record<
  keyof EventCallbacks,
  (handler: (event: PresenterEvent) => void) => EventSubscription
> = {
  [EVENT_TYPES.TRANSACTION_STARTED]:
    NativePaywallscreenPresenter.onTransactionStarted,
  [EVENT_TYPES.TRANSACTION_COMPLETED]:
    NativePaywallscreenPresenter.onTransactionCompleted,
  [EVENT_TYPES.CLOSE_BUTTON_TAPPED]:
    NativePaywallscreenPresenter.onCloseButtonTapped,
  [EVENT_TYPES.ERROR]: NativePaywallscreenPresenter.onError,
  [EVENT_TYPES.SCREEN_SHOWN]: NativePaywallscreenPresenter.onScreenShown,
};

function decodePayload(payload: string | null): any {
  if (payload == null) {
    return undefined;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

const NOP = () => {};

/**
 * Manages displaying the paywall screen and subscribing
 * to events emitted by the native layer.
 *
 * Each instance has a unique identifier used to:
 * - associate native events with the correct presenter
 * - isolate multiple paywall screens from each other
 */
export class PaywallScreenPresenter implements IDisposable {
  /**
   * Indicates whether this presenter has been disposed.
   * Once disposed, the instance must no longer be used.
   */
  private isDisposed = false;

  /**
   * Unique identifier of this presenter instance.
   * Used to filter events received from NativeEventEmitter.
   */
  private readonly id = (++paywallScreenPresenterIdInternal).toString();

  /**
   * Collection of active event subscriptions.
   * Used to properly clean up listeners on dispose().
   */
  private subscriptions: Set<EventSubscription> = new Set();

  /**
   * Creates a new PaywallScreenPresenter instance.
   *
   * @param options Paywall screen options
   */
  constructor(private readonly options: Partial<Options> = {}) {}

  /**
   * Displays the paywall screen.
   *
   * Passes the following data to the native layer:
   * - paywall options
   * - unique presenter identifier
   */
  displayPaywallScreen() {
    NativePaywallscreenPresenter.displayPaywallScreen({
      ...this.options,
      paywallScreenPresenterId: this.id,
    });
  }

  /**
   * Subscribes to a paywall screen event.
   *
   * The callback will only be invoked if the event
   * belongs to the current presenter instance.
   *
   * @template Name
   * @param name Event type
   * @param callback Event handler
   * @returns Function to unsubscribe from the event
   */
  addEventListener<Name extends keyof EventCallbacks>(
    name: Name,
    callback: EventCallbacks[Name]
  ) {
    if (this.isDisposed) {
      return NOP;
    }

    const subscription = NATIVE_SUBSCRIBERS[name](
      ({ paywallScreenPresenterId, payload }) => {
        if (paywallScreenPresenterId === this.id) {
          (callback as (arg?: any) => void)(decodePayload(payload));
        }
      }
    );

    this.subscriptions.add(subscription);

    return () => {
      if (this.isDisposed) {
        return;
      }

      this.subscriptions.delete(subscription);
      subscription.remove();
    };
  }

  /**
   * Disposes the presenter instance.
   *
   * - Removes all event subscriptions
   * - Prevents further callbacks from being invoked
   * - Releases associated resources
   */
  dispose() {
    this.isDisposed = true;

    for (const sub of this.subscriptions.values()) {
      sub.remove();
    }
  }
}
