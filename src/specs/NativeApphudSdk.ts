import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes, TurboModule } from 'react-native';

/**
 * Codegen spec for the `ApphudSdk` Turbo Native Module.
 *
 * Payloads are passed as untyped objects (`CodegenTypes.UnsafeObject`) because Apphud
 * entities are deeply nested and platform specific. The public, fully typed
 * API lives in `src/module/ApphudSdk.ts`, which wraps this module.
 *
 * Every method must be implemented on both platforms — TurboModules resolve
 * eagerly against the generated interface, so a missing method is a build
 * error on Android and a runtime error on iOS. Methods that only make sense on
 * one platform are implemented as no-ops or rejections on the other.
 */
export interface Spec extends TurboModule {
  start(options: CodegenTypes.UnsafeObject): Promise<CodegenTypes.UnsafeObject>;
  startManually(
    options: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject>;
  userId(): Promise<string>;

  placements(
    options: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject[]>;
  placement(
    identifier: string,
    options: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject | null>;
  rawPlacements(): Promise<CodegenTypes.UnsafeObject[]>;

  setHost(url: string): void;
  handleDeeplinkUrl(url: string): void;
  requestDeferredDeeplinkAttribution(): Promise<void>;

  isCommitmentPlanPreferred(
    options: CodegenTypes.UnsafeObject
  ): Promise<boolean>;
  isCommitmentPlanSupported(
    options: CodegenTypes.UnsafeObject
  ): Promise<boolean>;

  paywallShown(options: CodegenTypes.UnsafeObject): void;

  products(): Promise<CodegenTypes.UnsafeObject[]>;
  hasPremiumAccess(): Promise<boolean>;
  hasActiveSubscription(): Promise<boolean>;

  purchase(
    props: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject>;
  checkEligibilityForPromotionalOffer(
    props: CodegenTypes.UnsafeObject
  ): Promise<boolean>;
  purchasePromo(
    props: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject>;
  restorePurchases(): Promise<CodegenTypes.UnsafeObject>;
  syncPurchasesInObserverMode(): Promise<boolean>;

  subscription(): Promise<CodegenTypes.UnsafeObject | null>;
  subscriptions(): Promise<CodegenTypes.UnsafeObject[]>;
  nonRenewingPurchases(): Promise<CodegenTypes.UnsafeObject[]>;
  isNonRenewingPurchaseActive(productIdentifier: string): Promise<boolean>;

  setAttribution(options: CodegenTypes.UnsafeObject): Promise<boolean>;
  attributeFromWeb(
    options: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject>;

  setUserProperty(args: CodegenTypes.UnsafeObject): void;
  incrementUserProperty(args: CodegenTypes.UnsafeObject): void;

  collectDeviceIdentifiers(): void;
  setDeviceIdentifiers(options: CodegenTypes.UnsafeObject): void;
  optOutOfTracking(): void;
  enableDebugLogs(): void;
  logout(): Promise<void>;

  checkRules(): Promise<void>;
  pendingRule(): Promise<CodegenTypes.UnsafeObject | null>;
  showPendingRuleScreen(): Promise<boolean>;
  submitPushNotificationsToken(token: string): Promise<boolean>;
  handlePushNotification(payload: CodegenTypes.UnsafeObject): Promise<boolean>;

  idfv(): Promise<string | null>;
  preloadPaywallScreens(placementIdentifiers: string[]): void;
  unloadPaywallScreen(options: CodegenTypes.UnsafeObject): Promise<void>;

  updateUserID(userID: string): Promise<CodegenTypes.UnsafeObject | null>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ApphudSdk');
