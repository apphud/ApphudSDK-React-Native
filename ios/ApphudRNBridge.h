#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Encodes `value` as a JSON string. Values JSON cannot represent — dates, URLs
 * and the arbitrary objects that end up in `NSError.userInfo` — are converted
 * to numbers or strings instead of failing the whole payload.
 *
 * Returns `nil` for `nil` and `NSNull`.
 */
FOUNDATION_EXPORT NSString *_Nullable ApphudJSONStringFromObject(id _Nullable value);

/**
 * Codegen emits the `emitOn…` methods onto Obj-C++ base classes, which Swift
 * cannot import. The Swift implementations therefore emit through the protocols
 * below, and the Obj-C++ module wrappers forward every call to its generated
 * counterpart.
 *
 * Method names mirror the generated ones (`emitFoo:` -> `emitOnFoo:`) so the
 * two stay easy to diff.
 */
@protocol ApphudSdkEventsEmitting <NSObject>

- (void)emitPlacementsDidFullyLoad:(NSArray *)value;
- (void)emitUserDidLoad:(NSDictionary *)value;
- (void)emitApphudDidLoadStoreProducts:(NSArray *)value;
- (void)emitApphudDidChangeUserID:(NSString *)value;
- (void)emitApphudSubscriptionsUpdated:(NSArray *)value;
- (void)emitApphudNonRenewingPurchasesUpdated:(NSArray *)value;

- (void)emitApphudScreenDidAppear:(NSDictionary *)value;
- (void)emitApphudDidPurchase:(NSDictionary *)value;
- (void)emitApphudWillPurchase:(NSDictionary *)value;
- (void)emitApphudDidFailPurchase:(NSDictionary *)value;
- (void)emitApphudDidSelectSurveyAnswer:(NSDictionary *)value;

- (void)emitApphudRuleScreenDidAppear:(NSDictionary *)value;
- (void)emitApphudRuleWillPurchase:(NSDictionary *)value;
- (void)emitApphudRulePurchaseCompleted:(NSDictionary *)value;
- (void)emitApphudRuleScreenWillDismiss:(NSDictionary *)value;
- (void)emitApphudRuleScreenDidDismiss:(NSDictionary *)value;
- (void)emitApphudRuleDidSelectSurveyAnswer:(NSDictionary *)value;
- (void)emitApphudRulePaywallWithoutScreen:(NSDictionary *)value;

- (void)emitApphudDeeplinkAttribution:(NSDictionary *)value;

@end

/**
 * Presenter events all carry `{ paywallScreenPresenterId, payload }`, where
 * `payload` is a JSON string produced by `ApphudJSONStringFromObject`.
 */
@protocol ApphudPaywallScreenPresenterEmitting <NSObject>

- (void)emitPresenterTransactionStarted:(NSDictionary *)value;
- (void)emitPresenterTransactionCompleted:(NSDictionary *)value;
- (void)emitPresenterCloseButtonTapped:(NSDictionary *)value;
- (void)emitPresenterScreenShown:(NSDictionary *)value;
- (void)emitPresenterError:(NSDictionary *)value;

@end

NS_ASSUME_NONNULL_END
