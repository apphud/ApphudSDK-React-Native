#import "ApphudRNBridge.h"

static id ApphudJSONSafeObject(id _Nullable value)
{
  if (value == nil || [value isKindOfClass:[NSNull class]]) {
    return [NSNull null];
  }

  if ([value isKindOfClass:[NSString class]]) {
    return value;
  }

  if ([value isKindOfClass:[NSNumber class]]) {
    NSNumber *number = value;
    double doubleValue = number.doubleValue;
    // NaN and infinity are not representable in JSON.
    if (isnan(doubleValue) || isinf(doubleValue)) {
      return [NSNull null];
    }
    return number;
  }

  if ([value isKindOfClass:[NSArray class]]) {
    NSArray *array = value;
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:array.count];
    for (id element in array) {
      [result addObject:ApphudJSONSafeObject(element)];
    }
    return result;
  }

  if ([value isKindOfClass:[NSDictionary class]]) {
    NSDictionary *dictionary = value;
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:dictionary.count];
    for (id key in dictionary) {
      NSString *stringKey = [key isKindOfClass:[NSString class]] ? key : [key description];
      if (stringKey != nil) {
        result[stringKey] = ApphudJSONSafeObject(dictionary[key]);
      }
    }
    return result;
  }

  if ([value isKindOfClass:[NSDate class]]) {
    return @([(NSDate *)value timeIntervalSince1970]);
  }

  if ([value isKindOfClass:[NSURL class]]) {
    return [(NSURL *)value absoluteString];
  }

  return [value description];
}

NSString *_Nullable ApphudJSONStringFromObject(id _Nullable value)
{
  if (value == nil || [value isKindOfClass:[NSNull class]]) {
    return nil;
  }

  id safeValue = ApphudJSONSafeObject(value);
  if (![NSJSONSerialization isValidJSONObject:safeValue]) {
    // Scalars are only valid as fragments.
    safeValue = @[ safeValue ];
    NSData *data = [NSJSONSerialization dataWithJSONObject:safeValue options:0 error:NULL];
    if (data == nil) {
      return nil;
    }
    NSString *wrapped = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    // Strip the wrapping brackets to get the bare fragment back.
    return [wrapped substringWithRange:NSMakeRange(1, wrapped.length - 2)];
  }

  NSData *data = [NSJSONSerialization dataWithJSONObject:safeValue options:0 error:NULL];
  if (data == nil) {
    return nil;
  }

  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}
