package com.reactnativeapphudsdk;

import com.apphud.sdk.ApphudInternal;
import com.apphud.sdk.ApphudInternal_RestorePurchasesKt;
import com.apphud.sdk.ApphudPurchasesRestoreResult;
import kotlin.coroutines.EmptyCoroutineContext;
import kotlinx.coroutines.BuildersKt;
import kotlinx.coroutines.CoroutineStart;
import kotlinx.coroutines.Deferred;

/**
 * Adapter for the published Android SDK 3.7.1 JVM ABI.
 *
 * <p>ApphudFlutter.syncPurchases uses this same native operation but discards its
 * result. This adapter preserves RN's boolean completion without using Restore
 * or reimplementing validation. Java can call these public JVM methods without
 * relying on Kotlin's unsupported visibility-error suppression. Keep internal
 * ABI access here and verify it whenever the native dependency changes.
 */
final class ApphudObserverSync {
  private ApphudObserverSync() {}

  static boolean usesV1() {
    // An unresolved installation ID can also be null in V2 during startup.
    return ApphudInternal.INSTANCE.isIdentityV1$sdk_release();
  }

  static Deferred<ApphudPurchasesRestoreResult> start() {
    // The native session owns this job: logout cancels an in-flight sync.
    return BuildersKt.async(
      ApphudInternal.INSTANCE.getCoroutineScope$sdk_release(),
      EmptyCoroutineContext.INSTANCE,
      CoroutineStart.DEFAULT,
      (scope, completion) -> ApphudInternal_RestorePurchasesKt.syncPurchases(
        ApphudInternal.INSTANCE,
        null,
        null,
        true,
        null,
        false,
        completion
      )
    );
  }
}
