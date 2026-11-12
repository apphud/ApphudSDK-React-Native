# Changelog

## 5.3.1 — 2026-11-12

- Deferred deep link attribution no longer uses a hidden web view. This avoids a rare crash on first launch on iOS 27; on Android the call no longer needs a visible screen. Subscribe to `onApphudDeeplinkAttribution` before calling `ApphudSdk.requestDeferredDeeplinkAttribution()`: a result that arrives while no listener is set is not delivered.
- Updated native dependencies to iOS 4.7.2 and Android 3.7.2.

## 5.3.0 — 2026-10-22

- Improved user session management.
- Improved purchase synchronization and subscription restoration handling.
- Updated native dependencies to iOS 4.7.0 and Android 3.7.1.
