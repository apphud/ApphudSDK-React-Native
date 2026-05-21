# Third-Party Software and License Agreements (React Native SDK)

Generated at: 2026-05-13T11:58:01Z (UTC)
Source of truth: root `package.json` + root `yarn.lock` + root `package-lock.json` (drift check) + `example/package.json` + `example/yarn.lock`

## Scope

- This report covers the repository root SDK package and the `example/` app separately.
- SDK runtime dependencies are taken from root `package.json` `dependencies`.
- SDK dev dependencies are taken from root `package.json` `devDependencies`.
- SDK peer dependencies are listed separately because they are required by consumers but not bundled by the published SDK package.
- `example/` inventories are informational only and are not part of the published SDK artifact.

## Summary

- SDK runtime dependencies in root package: `0`
- SDK dev dependencies in root package: `19`
- SDK peer dependencies (consumer-provided): `2`
- Example app runtime dependencies: `11`
- Example app dev dependencies: `18`

## Lockfile Notes

- Root package management is Yarn-based (`packageManager: yarn@4.6.0...`), so SDK resolved versions below follow root `yarn.lock`.
- Root `package-lock.json` is not synchronized with the current root `package.json` (`package-lock.json` root version `2.0.0` vs `package.json` version `4.1.0`).
- Root `package-lock.json` still declares legacy root runtime deps: `@apphud/react-native-apphud-sdk, @react-native/metro-config, react-native-reanimated, react-native-vector-icons`.
- Current root `package.json` runtime deps: `(none)`.
- Root `package-lock.json` also still carries an older root constraint for `react-native-builder-bob` (`^0.23.1`) while current root `package.json` declares `^0.37.0`.
- Example app resolved versions below follow `example/yarn.lock`.

## SDK Runtime Dependency Inventory

| Package | Constraint | Resolved Version | License | License Class | Reference | Notes |
|---|---|---|---|---|---|---|
| `-` | `-` | `-` | `-` | `-` | `-` | no runtime dependencies declared in root SDK package |

## SDK Dev Dependencies

| Package | Constraint | Resolved Version | License | License Class | Reference | Notes |
|---|---|---|---|---|---|---|
| `@commitlint/config-conventional` | `^18.4.0` | `18.4.0` | `MIT` | `Permissive` | [link](https://github.com/conventional-changelog/commitlint.git) | SDK development/tooling dependency |
| `@react-native-community/eslint-config` | `^3.2.0` | `3.2.0` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native.git) | SDK development/tooling dependency |
| `@release-it/conventional-changelog` | `^8.0.1` | `8.0.1` | `MIT` | `Permissive` | [link](https://github.com/release-it/conventional-changelog.git) | SDK development/tooling dependency |
| `@types/jest` | `^29.5.8` | `29.5.8` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | SDK development/tooling dependency |
| `@types/react` | `^18.2.37` | `18.2.37` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | SDK development/tooling dependency |
| `@types/react-native` | `0.72.6` | `0.72.6` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | SDK development/tooling dependency |
| `commitlint` | `^18.4.1` | `18.4.1` | `MIT` | `Permissive` | [link](https://github.com/conventional-changelog/commitlint.git) | SDK development/tooling dependency |
| `eslint` | `^8.53.0` | `8.53.0` | `MIT` | `Permissive` | [link](https://github.com/eslint/eslint) | SDK development/tooling dependency |
| `eslint-config-prettier` | `^9.0.0` | `9.0.0` | `MIT` | `Permissive` | [link](https://github.com/prettier/eslint-config-prettier) | SDK development/tooling dependency |
| `eslint-plugin-prettier` | `^5.0.1` | `5.0.1` | `MIT` | `Permissive` | [link](https://github.com/prettier/eslint-plugin-prettier.git) | SDK development/tooling dependency |
| `jest` | `^29.7.0` | `29.7.0` | `MIT` | `Permissive` | [link](https://github.com/jestjs/jest.git) | SDK development/tooling dependency |
| `metro-config` | `^0.80.1` | `0.80.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/metro.git) | SDK development/tooling dependency |
| `pod-install` | `^0.1.39` | `0.1.39` | `MIT` | `Permissive` | [link](https://github.com/expo/expo-cli.git) | SDK development/tooling dependency |
| `prettier` | `^3.1.0` | `3.1.0` | `MIT` | `Permissive` | [link](https://github.com/prettier/prettier) | SDK development/tooling dependency |
| `react` | `18.2.0` | `18.2.0` | `MIT` | `Permissive` | [link](https://github.com/facebook/react.git) | SDK local development/testing dependency |
| `react-native` | `0.71` | `0.71.14` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native) | SDK local development/testing dependency |
| `react-native-builder-bob` | `^0.37.0` | `0.37.0` | `MIT` | `Permissive` | [link](https://github.com/callstack/react-native-builder-bob.git) | SDK build dependency |
| `release-it` | `^17.0.0` | `17.0.0` | `MIT` | `Permissive` | [link](https://github.com/release-it/release-it.git) | SDK release tooling dependency |
| `typescript` | `^5.2.2` | `5.2.2` | `Apache-2.0` | `Permissive` | [link](https://github.com/Microsoft/TypeScript.git) | SDK development/tooling dependency |

## SDK Peer Dependencies (Not Bundled)

| Package | Constraint | Resolved Version | License | License Class | Reference | Notes |
|---|---|---|---|---|---|---|
| `react` | `*` | `-` | `MIT` | `Permissive` | [link](git+https://github.com/facebook/react.git) | required from consuming app (`peerDependencies`) |
| `react-native` | `*` | `-` | `MIT` | `Permissive` | [link](git+https://github.com/facebook/react-native.git) | required from consuming app (`peerDependencies`) |

## Example App Runtime Dependencies

| Package | Constraint | Resolved Version | License | License Class | Reference | Notes |
|---|---|---|---|---|---|---|
| `@react-native-community/masked-view` | `^0.1.11` | `0.1.11` | `MIT` | `Permissive` | [link](https://github.com/react-native-community/react-native-masked-view.git) | example app only; not bundled in SDK |
| `@react-navigation/native` | `^7.0.14` | `7.1.25` | `MIT` | `Permissive` | [link](https://github.com/react-navigation/react-navigation.git) | example app only; not bundled in SDK |
| `@react-navigation/stack` | `^7.1.1` | `7.6.12` | `MIT` | `Permissive` | [link](https://github.com/react-navigation/react-navigation.git) | example app only; not bundled in SDK |
| `babel-plugin-module-resolver` | `^5.0.2` | `5.0.2` | `MIT` | `Permissive` | [link](https://github.com/tleunen/babel-plugin-module-resolver.git) | example app only; not bundled in SDK |
| `react` | `18.3.1` | `18.3.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react.git) | example app only; not bundled in SDK |
| `react-native` | `0.77.1` | `0.77.1` | `MIT` | `Permissive` | [link](git+https://github.com/facebook/react-native.git) | example app only; not bundled in SDK |
| `react-native-elements` | `^3.4.3` | `3.4.3` | `MIT` | `Permissive` | [link](https://github.com/react-native-elements/react-native-elements.git) | example app only; not bundled in SDK |
| `react-native-gesture-handler` | `^2.23.1` | `2.29.1` | `MIT` | `Permissive` | [link](https://github.com/software-mansion/react-native-gesture-handler.git) | example app only; not bundled in SDK |
| `react-native-reanimated` | `3.17.3` | `3.17.3` | `MIT` | `Permissive` | [link](https://github.com/software-mansion/react-native-reanimated.git) | example app only; not bundled in SDK |
| `react-native-safe-area-context` | `^5.2.0` | `5.6.2` | `MIT` | `Permissive` | [link](https://github.com/AppAndFlow/react-native-safe-area-context.git) | example app only; not bundled in SDK |
| `react-native-vector-icons` | `^10.2.0` | `10.3.0` | `MIT` | `Permissive` | [link](https://github.com/oblador/react-native-vector-icons.git) | example app only; not bundled in SDK |

## Example App Dev Dependencies

| Package | Constraint | Resolved Version | License | License Class | Reference | Notes |
|---|---|---|---|---|---|---|
| `@babel/core` | `^7.25.2` | `7.28.5` | `MIT` | `Permissive` | [link](https://github.com/babel/babel.git) | example app tooling only; not bundled in SDK |
| `@babel/preset-env` | `^7.25.3` | `7.28.5` | `MIT` | `Permissive` | [link](https://github.com/babel/babel.git) | example app tooling only; not bundled in SDK |
| `@babel/runtime` | `^7.25.0` | `7.28.4` | `MIT` | `Permissive` | [link](https://github.com/babel/babel.git) | example app tooling only; not bundled in SDK |
| `@react-native-community/cli` | `15.0.1` | `15.0.1` | `MIT` | `Permissive` | [link](https://github.com/react-native-community/cli.git) | example app tooling only; not bundled in SDK |
| `@react-native-community/cli-platform-android` | `15.0.1` | `15.0.1` | `MIT` | `Permissive` | [link](https://github.com/react-native-community/cli.git) | example app tooling only; not bundled in SDK |
| `@react-native-community/cli-platform-ios` | `15.0.1` | `15.0.1` | `MIT` | `Permissive` | [link](https://github.com/react-native-community/cli.git) | example app tooling only; not bundled in SDK |
| `@react-native/babel-preset` | `0.77.1` | `0.77.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native.git) | example app tooling only; not bundled in SDK |
| `@react-native/eslint-config` | `0.77.1` | `0.77.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native.git) | example app tooling only; not bundled in SDK |
| `@react-native/metro-config` | `0.77.1` | `0.77.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native.git) | example app tooling only; not bundled in SDK |
| `@react-native/typescript-config` | `0.77.1` | `0.77.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react-native.git) | example app tooling only; not bundled in SDK |
| `@types/jest` | `^29.5.13` | `29.5.14` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | example app tooling only; not bundled in SDK |
| `@types/react` | `^18.2.6` | `18.3.27` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | example app tooling only; not bundled in SDK |
| `@types/react-test-renderer` | `^18.0.0` | `18.3.1` | `MIT` | `Permissive` | [link](https://github.com/DefinitelyTyped/DefinitelyTyped.git) | example app tooling only; not bundled in SDK |
| `eslint` | `^8.19.0` | `8.57.1` | `MIT` | `Permissive` | [link](https://github.com/eslint/eslint) | example app tooling only; not bundled in SDK |
| `jest` | `^29.6.3` | `29.7.0` | `MIT` | `Permissive` | [link](https://github.com/jestjs/jest.git) | example app tooling only; not bundled in SDK |
| `prettier` | `2.8.8` | `2.8.8` | `MIT` | `Permissive` | [link](https://github.com/prettier/prettier) | example app tooling only; not bundled in SDK |
| `react-test-renderer` | `18.3.1` | `18.3.1` | `MIT` | `Permissive` | [link](https://github.com/facebook/react.git) | example app tooling only; not bundled in SDK |
| `typescript` | `5.0.4` | `5.0.4` | `Apache-2.0` | `Permissive` | [link](https://github.com/Microsoft/TypeScript.git) | example app tooling only; not bundled in SDK |
