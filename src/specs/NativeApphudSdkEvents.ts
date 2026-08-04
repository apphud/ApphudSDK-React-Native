import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes, TurboModule } from 'react-native';

/**
 * Codegen spec for the `ApphudSdkEvents` Turbo Native Module.
 *
 * Events are declared with the codegen `EventEmitter` type, which replaces the
 * legacy `RCTEventEmitter` / `RCTDeviceEventEmitter` plumbing removed with the
 * old architecture. Each `onXxx` property generates an `emitOnXxx` method on
 * the native spec base class.
 *
 * The public API in `src/events/ApphudSdkEventEmitter.ts` keeps the historical
 * event names, so this rename is not visible to SDK consumers.
 */
export interface Spec extends TurboModule {
  readonly onPlacementsDidFullyLoad: CodegenTypes.EventEmitter<
    CodegenTypes.UnsafeObject[]
  >;
  readonly onUserDidLoad: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudDidLoadStoreProducts: CodegenTypes.EventEmitter<
    CodegenTypes.UnsafeObject[]
  >;
  readonly onApphudDidChangeUserID: CodegenTypes.EventEmitter<string>;
  readonly onApphudSubscriptionsUpdated: CodegenTypes.EventEmitter<
    CodegenTypes.UnsafeObject[]
  >;
  readonly onApphudNonRenewingPurchasesUpdated: CodegenTypes.EventEmitter<
    CodegenTypes.UnsafeObject[]
  >;

  readonly onApphudScreenDidAppear: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudDidPurchase: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudWillPurchase: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudDidFailPurchase: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudDidSelectSurveyAnswer: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;

  readonly onApphudRuleScreenDidAppear: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRuleWillPurchase: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRulePurchaseCompleted: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRuleScreenWillDismiss: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRuleScreenDidDismiss: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRuleDidSelectSurveyAnswer: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;
  readonly onApphudRulePaywallWithoutScreen: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;

  readonly onApphudDeeplinkAttribution: CodegenTypes.EventEmitter<CodegenTypes.UnsafeObject>;

  setApphudProductIdentifiers(ids: string[]): Promise<string[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ApphudSdkEvents');
