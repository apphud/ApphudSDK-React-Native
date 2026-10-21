package com.reactnativeapphudsdk

import com.apphud.sdk.ApphudIdentityVersion
import com.facebook.react.bridge.JavaOnlyMap
import org.junit.Assert.assertEquals
import org.junit.Test

class ApphudIdentityVersionTest {
  @Test fun defaultsToV1() {
    assertEquals(ApphudIdentityVersion.V1, identityVersionFromOptions(JavaOnlyMap()))
    assertEquals(ApphudIdentityVersion.V1, identityVersionFromOptions(JavaOnlyMap.of("identityVersion", null)))
  }

  @Test fun acceptsExplicitV2WithoutHostIds() {
    assertEquals(ApphudIdentityVersion.V2, identityVersionFromOptions(JavaOnlyMap.of("identityVersion", "v2")))
  }

  @Test fun keepsLegacyDeviceIdInV1() {
    assertEquals(ApphudIdentityVersion.V1, identityVersionFromOptions(JavaOnlyMap.of("deviceId", "legacy")))
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsNumericVersions() {
    identityVersionFromOptions(JavaOnlyMap.of("identityVersion", 2))
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsUnknownVersions() {
    identityVersionFromOptions(JavaOnlyMap.of("identityVersion", "v3"))
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsHostDeviceIdsInV2() {
    identityVersionFromOptions(JavaOnlyMap.of("identityVersion", "v2", "deviceId", "host"))
  }
}
