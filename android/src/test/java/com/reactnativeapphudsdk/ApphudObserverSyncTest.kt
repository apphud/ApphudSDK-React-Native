@file:Suppress("INVISIBLE_REFERENCE", "INVISIBLE_MEMBER")

package com.reactnativeapphudsdk

import com.apphud.sdk.Apphud
import com.apphud.sdk.ApphudError
import com.apphud.sdk.ApphudInternal
import com.apphud.sdk.ApphudPurchasesRestoreResult
import com.apphud.sdk.syncPurchases
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import io.mockk.*
import java.io.IOException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestCoroutineScheduler
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ApphudObserverSyncTest {
  private val scheduler = TestCoroutineScheduler()
  private val dispatcher = StandardTestDispatcher(scheduler)
  private val nativeSession = SupervisorJob()
  private val nativeScope = CoroutineScope(nativeSession + dispatcher)
  private val success = ApphudPurchasesRestoreResult.Success(emptyList(), emptyList())
  private val failure = ApphudPurchasesRestoreResult.Error(ApphudError("validation failed"))
  private lateinit var module: ApphudSdkModule
  private lateinit var promise: Promise

  @Before fun setUp() {
    Dispatchers.setMain(dispatcher)
    mockkObject(Apphud, ApphudInternal)
    mockkStatic("com.apphud.sdk.ApphudInternal_RestorePurchasesKt")
    every { Apphud.installationId() } returns "native-installation"
    every { ApphudInternal.isIdentityV1 } returns false
    every { ApphudInternal.coroutineScope } returns nativeScope
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } returns success
    module = ApphudSdkModule(mockk<ReactApplicationContext>(relaxed = true))
    promise = mockk(relaxed = true)
  }

  @After fun tearDown() {
    nativeSession.cancel()
    scheduler.advanceUntilIdle()
    unmockkAll()
    Dispatchers.resetMain()
  }

  private fun verifyResult(expected: Boolean) {
    verify(exactly = 1) { promise.resolve(expected) }
    verify(exactly = 1) { promise.resolve(any()) }
    verify(exactly = 0) { promise.reject(any<String>(), any<String>(), any<Throwable>()) }
  }

  @Test fun v2UsesObserverSyncWithoutTransfer() {
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()

    coVerify(exactly = 1) {
      ApphudInternal.syncPurchases(null, null, true, null, false)
    }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
    verifyResult(true)
  }

  @Test fun v1KeepsLegacyRestoreResult() {
    every { Apphud.installationId() } returns null
    every { ApphudInternal.isIdentityV1 } returns true
    every { Apphud.restorePurchases(any()) } answers {
      firstArg<(ApphudPurchasesRestoreResult) -> Unit>()(success)
    }

    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()

    verify(exactly = 1) { Apphud.restorePurchases(any()) }
    coVerify(exactly = 0) { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) }
    verifyResult(true)
  }

  @Test fun v1KeepsLegacyFailureResult() {
    every { Apphud.installationId() } returns null
    every { ApphudInternal.isIdentityV1 } returns true
    every { Apphud.restorePurchases(any()) } answers {
      firstArg<(ApphudPurchasesRestoreResult) -> Unit>()(failure)
    }

    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verifyResult(false)
  }

  @Test fun doesNotResolveBeforeNativeValidationFinishes() {
    val response = CompletableDeferred<ApphudPurchasesRestoreResult>()
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } coAnswers {
      response.await()
    }
    module.syncPurchasesInObserverMode(promise)
    scheduler.runCurrent()
    verify(exactly = 0) { promise.resolve(any()) }

    response.complete(failure)
    scheduler.advanceUntilIdle()
    verifyResult(false)
  }

  @Test fun serverFailureDoesNotBecomeSuccessfulBillingQuery() {
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } returns failure
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verifyResult(false)
  }

  @Test fun thrownSyncFailureResolvesFalseWithoutRestoreFallback() {
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } throws IOException("offline")
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verifyResult(false)
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
  }

  @Test fun logoutBeforeDispatchCompletesThePromiseWithoutSubmitting() {
    module.syncPurchasesInObserverMode(promise)
    nativeSession.cancel()
    scheduler.advanceUntilIdle()
    verifyResult(false)
    coVerify(exactly = 0) { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) }
  }

  @Test fun logoutCancelsAnInFlightSync() {
    val response = CompletableDeferred<ApphudPurchasesRestoreResult>()
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } coAnswers {
      response.await()
    }
    module.syncPurchasesInObserverMode(promise)
    scheduler.runCurrent()
    nativeSession.cancel()
    scheduler.advanceUntilIdle()
    response.complete(success)
    scheduler.advanceUntilIdle()
    verifyResult(false)
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
  }

  @Test fun concurrentCallsKeepTheirOwnNativeResults() {
    val first = CompletableDeferred<ApphudPurchasesRestoreResult>()
    val second = CompletableDeferred<ApphudPurchasesRestoreResult>()
    val responses = ArrayDeque(listOf(first, second))
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } coAnswers {
      responses.removeFirst().await()
    }
    val other: Promise = mockk(relaxed = true)
    module.syncPurchasesInObserverMode(promise)
    module.syncPurchasesInObserverMode(other)
    scheduler.runCurrent()

    second.complete(failure)
    scheduler.runCurrent()
    verify(exactly = 1) { other.resolve(false) }
    verify(exactly = 0) { promise.resolve(any()) }
    first.complete(success)
    scheduler.advanceUntilIdle()
    verifyResult(true)
    verify(exactly = 1) { other.resolve(any()) }
  }

  @Test fun incompatibleNativeScopeRejectsWithoutRestoreFallback() {
    every { ApphudInternal.coroutineScope } throws NoSuchMethodError("changed native ABI")
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verify(exactly = 1) {
      promise.reject("observer_sync_unavailable", any<String>(), any<Throwable>())
    }
    verify(exactly = 0) { promise.resolve(any()) }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
  }

  @Test fun incompatibleNativeSyncRejectsWithoutRestoreFallback() {
    coEvery { ApphudInternal.syncPurchases(any(), any(), any(), any(), any()) } throws NoSuchMethodError("changed native ABI")
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verify(exactly = 1) {
      promise.reject("observer_sync_unavailable", any<String>(), any<Throwable>())
    }
    verify(exactly = 0) { promise.resolve(any()) }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
  }

  @Test fun remountedModuleUsesTheNativeIdentityModel() {
    module = ApphudSdkModule(mockk<ReactApplicationContext>(relaxed = true))
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    coVerify(exactly = 1) { ApphudInternal.syncPurchases(null, null, true, null, false) }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
    verifyResult(true)
  }

  @Test fun v2WithUnresolvedInstallationIdNeverUsesRestore() {
    every { Apphud.installationId() } returns null
    every { ApphudInternal.isIdentityV1 } returns false
    every { Apphud.restorePurchases(any()) } answers {
      firstArg<(ApphudPurchasesRestoreResult) -> Unit>()(success)
    }
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    coVerify(exactly = 1) { ApphudInternal.syncPurchases(null, null, true, null, false) }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
    verifyResult(true)
  }

  @Test fun incompatibleNativeModelRejectsWithoutRestoreFallback() {
    every { ApphudInternal.isIdentityV1 } throws NoSuchMethodError("changed native model ABI")
    module.syncPurchasesInObserverMode(promise)
    scheduler.advanceUntilIdle()
    verify(exactly = 1) {
      promise.reject("observer_sync_unavailable", any<String>(), any<Throwable>())
    }
    verify(exactly = 0) { promise.resolve(any()) }
    verify(exactly = 0) { Apphud.restorePurchases(any()) }
  }
}
