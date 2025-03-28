package com.reactnativeapphudsdk

import com.apphud.sdk.Apphud
import com.apphud.sdk.domain.ApphudPaywall

object Utils {
  fun paywall(
    paywallIdentifier: String?,
    placementIdentifier: String?,
    cb: (ApphudPaywall?) -> Unit
  ) {

    if (paywallIdentifier == null && placementIdentifier == null) {
      cb(null)
      return
    }

    placementIdentifier?.let { pId ->
      Apphud.fetchPlacements { apphudPlacements, _ ->
        cb(apphudPlacements.find { it.identifier == pId }?.paywall)
      }
    } ?: run {
      Apphud.paywallsDidLoadCallback { apphudPaywalls, _ ->
        val paywall = apphudPaywalls.firstOrNull { it.identifier == paywallIdentifier }
        cb(paywall)
      }
    }
  }
}
