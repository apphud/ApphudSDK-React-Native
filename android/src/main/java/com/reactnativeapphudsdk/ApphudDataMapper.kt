package com.reactnativeapphudsdk

import com.apphud.sdk.ApphudAttributionData
import com.apphud.sdk.ApphudAttributionProvider
import com.facebook.react.bridge.ReadableMap

internal data class AttributionParams(
  val identifier: String?,
  val provider: ApphudAttributionProvider,
  val data: ApphudAttributionData
)

private fun Map<String, Any?>.removeNullableValues(): Map<String, Any> {
  val map = mutableMapOf<String, Any>()

  for (pair in this) {
    pair.value?.let {
      map[pair.key] = it
    }
  }

  return map
}

internal fun ReadableMap.getAttributionParams(): AttributionParams? {
  val identifier = getString("identifier")

  val provider = getString("attributionProviderId")?.let { attributionProviderId ->
    ApphudAttributionProvider.entries.find {
      it.value == attributionProviderId
    }
  } ?: return null

  val data = getMap("data") ?: return null

  val rawData = data
    .getMap("rawData")
    ?.toHashMap()
    ?.toMap()
    ?.removeNullableValues() ?: emptyMap()

  return AttributionParams(
    identifier = identifier,
    provider = provider,
    data = ApphudAttributionData(
      rawData = rawData,
      adNetwork = data.getString("adNetwork"),
      channel = data.getString("channel"),
      campaign = data.getString("campaign"),
      adSet = data.getString("adSet"),
      creative = data.getString("creative"),
      keyword = data.getString("keyword"),
      custom1 = data.getString("custom1"),
      custom2 = data.getString("custom2")
    )
  )
}
