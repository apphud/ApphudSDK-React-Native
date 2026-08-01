package com.reactnativeapphudsdk

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import org.json.JSONArray
import org.json.JSONObject

/**
 * Codegen event payloads can only carry statically described types, so Apphud
 * entities are serialized to JSON and decoded back on the JavaScript side.
 */
internal fun ReadableMap.toJsonString(): String = toJsonObject().toString()

internal fun ReadableMap.toJsonObject(): JSONObject {
  val json = JSONObject()
  val iterator = keySetIterator()

  while (iterator.hasNextKey()) {
    val key = iterator.nextKey()

    json.put(
      key,
      when (getType(key)) {
        ReadableType.Null -> JSONObject.NULL
        ReadableType.Boolean -> getBoolean(key)
        ReadableType.Number -> getDouble(key)
        ReadableType.String -> getString(key) ?: JSONObject.NULL
        ReadableType.Map -> getMap(key)?.toJsonObject() ?: JSONObject.NULL
        ReadableType.Array -> getArray(key)?.toJsonArray() ?: JSONObject.NULL
      }
    )
  }

  return json
}

internal fun ReadableArray.toJsonArray(): JSONArray {
  val json = JSONArray()

  for (index in 0 until size()) {
    json.put(
      when (getType(index)) {
        ReadableType.Null -> JSONObject.NULL
        ReadableType.Boolean -> getBoolean(index)
        ReadableType.Number -> getDouble(index)
        ReadableType.String -> getString(index) ?: JSONObject.NULL
        ReadableType.Map -> getMap(index)?.toJsonObject() ?: JSONObject.NULL
        ReadableType.Array -> getArray(index)?.toJsonArray() ?: JSONObject.NULL
      }
    )
  }

  return json
}
