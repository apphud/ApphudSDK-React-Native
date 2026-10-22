package com.reactnativeapphudsdk

import com.apphud.sdk.ApphudIdentityVersion
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType

internal fun identityVersionFromOptions(options: ReadableMap): ApphudIdentityVersion {
  val version = if (!options.hasKey("identityVersion") || options.isNull("identityVersion")) {
    ApphudIdentityVersion.V1
  } else {
    require(options.getType("identityVersion") == ReadableType.String) {
      "identityVersion must be v1 or v2"
    }
    when (options.getString("identityVersion")) {
      "v1" -> ApphudIdentityVersion.V1
      "v2" -> ApphudIdentityVersion.V2
      else -> throw IllegalArgumentException("identityVersion must be v1 or v2")
    }
  }
  require(version != ApphudIdentityVersion.V2 || !options.hasKey("deviceId") || options.isNull("deviceId")) {
    "deviceId is only supported in V1; V2 uses native SDK IDs"
  }
  return version
}
