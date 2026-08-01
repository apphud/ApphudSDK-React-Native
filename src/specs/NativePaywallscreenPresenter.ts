import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes, TurboModule } from 'react-native';

/**
 * Payload wrapper for presenter events.
 *
 * `paywallScreenPresenterId` routes the event to the `PaywallScreenPresenter`
 * instance that opened the screen; `payload` is the JSON-encoded event body,
 * since codegen cannot express the nested Apphud entities.
 */
export type PresenterEvent = {
  paywallScreenPresenterId: string;
  payload: string | null;
};

/**
 * Codegen spec for the `PaywallscreenPresenter` Turbo Native Module.
 */
export interface Spec extends TurboModule {
  displayPaywallScreen(options: CodegenTypes.UnsafeObject): void;

  readonly onTransactionStarted: CodegenTypes.EventEmitter<PresenterEvent>;
  readonly onTransactionCompleted: CodegenTypes.EventEmitter<PresenterEvent>;
  readonly onCloseButtonTapped: CodegenTypes.EventEmitter<PresenterEvent>;
  readonly onScreenShown: CodegenTypes.EventEmitter<PresenterEvent>;
  readonly onError: CodegenTypes.EventEmitter<PresenterEvent>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('PaywallscreenPresenter');
