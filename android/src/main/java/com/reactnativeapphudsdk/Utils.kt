package com.reactnativeapphudsdk

import com.apphud.sdk.APPHUD_DEFAULT_MAX_TIMEOUT
import com.apphud.sdk.Apphud
import com.apphud.sdk.domain.ApphudPaywall
import com.apphud.sdk.domain.ApphudPlacement
import com.apphud.sdk.domain.ApphudProduct
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

object Utils {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

  private fun resolvePaywall(
    placements: List<ApphudPlacement>,
    paywallIdentifier: String?,
    placementIdentifier: String?,
  ): ApphudPaywall? {
    return when {
      placementIdentifier != null ->
        placements.firstOrNull { it.identifier == placementIdentifier }?.paywall

      paywallIdentifier != null ->
        placements.firstOrNull { it.paywall?.identifier == paywallIdentifier }?.paywall

      else -> null
    }
  }

  internal suspend fun loadPlacements(
    preferredTimeout: Double = APPHUD_DEFAULT_MAX_TIMEOUT,
    forceRefresh: Boolean = false,
  ): List<ApphudPlacement> {
    if (forceRefresh) {
      return suspendCoroutine { continuation ->
        Apphud.fetchPlacements(
          preferredTimeout = preferredTimeout,
          forceRefresh = true,
        ) { placements, _ ->
          continuation.resume(placements)
        }
      }
    }
    return Apphud.placements(preferredTimeout)
  }

  suspend fun getPaywall(
    paywallIdentifier: String?,
    placementIdentifier: String?,
    preferredTimeout: Double = APPHUD_DEFAULT_MAX_TIMEOUT,
    forceRefresh: Boolean = false,
  ): ApphudPaywall? {
    if (paywallIdentifier == null && placementIdentifier == null) {
      return null
    }
    val placements = loadPlacements(preferredTimeout, forceRefresh)
    return resolvePaywall(placements, paywallIdentifier, placementIdentifier)
  }

  suspend fun getProduct(
    productId: String,
    paywallIdentifier: String?,
    placementIdentifier: String?,
    preferredTimeout: Double = APPHUD_DEFAULT_MAX_TIMEOUT,
    forceRefresh: Boolean = false,
  ): ApphudProduct? {
    return getPaywall(
      paywallIdentifier = paywallIdentifier,
      placementIdentifier = placementIdentifier,
      preferredTimeout = preferredTimeout,
      forceRefresh = forceRefresh,
    )?.products?.find { it.productId == productId }
  }

  internal suspend fun getPlacement(
    identifier: String,
    preferredTimeout: Double = APPHUD_DEFAULT_MAX_TIMEOUT,
    forceRefresh: Boolean = false,
  ): ApphudPlacement? {
    val placements = loadPlacements(preferredTimeout, forceRefresh)
    return placements.firstOrNull { it.identifier == identifier }
  }

  fun paywall(
    paywallIdentifier: String?,
    placementIdentifier: String?,
    cb: (ApphudPaywall?) -> Unit,
  ) {
    if (paywallIdentifier == null && placementIdentifier == null) {
      cb(null)
      return
    }

    scope.launch {
      cb(
        getPaywall(
          paywallIdentifier = paywallIdentifier,
          placementIdentifier = placementIdentifier,
        )
      )
    }
  }

  fun paywall(options: ReadableMap, cb: (ApphudPaywall?) -> Unit) {
    val paywallIdentifier = options.getString("paywallIdentifier")
    val placementIdentifier = options.getString("placementIdentifier")

    if (paywallIdentifier == null && placementIdentifier == null) {
      cb(null)
      return
    }

    val placementOptions = options.getPlacementsOptions()

    scope.launch {
      cb(
        getPaywall(
          paywallIdentifier = paywallIdentifier,
          placementIdentifier = placementIdentifier,
          preferredTimeout = placementOptions.preferredTimeout,
          forceRefresh = placementOptions.forceRefresh,
        )
      )
    }
  }
}
