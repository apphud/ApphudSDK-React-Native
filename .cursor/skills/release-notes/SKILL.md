---
name: release-notes
description: >-
  Formats SDK release notes and "what's new" in the Apphud Flutter-style pattern
  inside a markdown code block. Use when the user asks for release notes, what's
  new, changelog text, version announcement, or SDK upgrade summary.
---

# Release Notes Format

When the user asks for release notes, what's new, a changelog summary, or similar:

1. **Always** deliver the full text inside a single fenced **markdown** code block (` ```markdown ` … ` ``` `). Do not paste the release notes as raw chat markdown outside the block.
2. Follow the **Flutter / Apphud SDK** section pattern below.
3. Use the **target SDK's public API names** (e.g. React Native: `ApphudSdk`, `ApphudSdkEventEmitter`, `ApphudUser`; Flutter: `Apphud`, `ApphudListener`).
4. Call out **breaking changes** and **migration** in the relevant section (especially placement-first / removed APIs).
5. End with **Native SDK Updates** when version bumps apply (platform deps + wrapper version).

## Section pattern

Each item is one paragraph:

```markdown
**Short Title** — One or two sentences. Use `backticks` for types, methods, properties, and events. Mention iOS/Android availability when it differs.
```

Group under:

```markdown
## What's New in [Product] SDK X.Y.Z
```

Order sections roughly: user/metadata → new APIs → breaking/migration → model changes → platform-specific helpers → config/host → docs/naming → native dependency versions.

## Full template

Output exactly this shape (fill in content; keep the wrapper code block in the chat response):

```markdown
## What's New in [React Native / Flutter / …] Apphud SDK X.Y.Z

**User-Level Remote Config & Experiment Metadata** — `ApphudUser` (from `ApphudSdk.start()` / `startManually()` and `ApphudSdkEventEmitter.onUserDidLoad`) now includes `remoteConfig`, `remoteConfigString`, `experimentName`, `variationName`, `targetingName`, and `totalDevicesCount`, so you can drive UI/logic from Mission control targeting without an app update.

**Deep-Link Attribution** — Added `ApphudSdk.attributeFromDeeplink()` to attribute users from a recently opened deep link and receive attribution payload data when available.

**Placement-First API (Paywalls API Cleanup)** — SDK flow is now centered on placements/targetings. Legacy paywall-centric entry points were removed (…). Migrate to `ApphudSdk.placements()`, `ApphudSdk.placement()`, `ApphudSdk.rawPlacements()`, and `ApphudSdkEventEmitter.onPlacementsDidFullyLoad()`.

**Richer Placement & Product Models** — `ApphudPlacement` adds `variationName`. `ApphudProduct` adds `properties`, `variationIdentifier`, and `experimentId` for experiment/targeting context.

**Commitment Plan Helpers (iOS)** — Added `ApphudSdk.isCommitmentPlanPreferred()` and `ApphudSdk.isCommitmentPlanSupported()` (iOS 26.4+; Android returns `false`).

**Custom API Host** — Added `ApphudSdk.setHost()`. `baseUrl` on `StartProperties` for `start` / `startManually` is applied before SDK initialization.

**Mission control Naming** — Public documentation updated from Product Hub to Mission control.

**Native SDK Updates** — [Android] ApphudSDK-Android **A.B.C**, [iOS] ApphudSDK **X.Y.Z**, React Native wrapper **X.Y.Z**.
```

## Rules

- **Do not** use bullet lists for main sections; use bold titled paragraphs with em dashes (—), matching Flutter release notes.
- **Do not** omit the outer ` ```markdown ` code fence in the assistant message.
- Prefer factual, ship-ready copy; no engagement filler after the block.
- If the user only wants a subset (e.g. breaking changes only), still use the same section style and still wrap in ` ```markdown `.
