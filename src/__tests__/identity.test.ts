import NativeApphudSdk from '../specs/NativeApphudSdk';
import { ApphudSdk } from '../module/ApphudSdk';
import type { StartProperties } from '../module/types';

jest.mock('../specs/NativeApphudSdk', () => ({
  __esModule: true,
  default: {
    start: jest.fn(),
    startManually: jest.fn(),
    installationId: jest.fn(),
    anonymousId: jest.fn(),
    deviceId: jest.fn(),
    logout: jest.fn(),
    updateUserID: jest.fn(),
    restorePurchases: jest.fn(),
  },
}));
jest.mock('../specs/NativeApphudSdkEvents', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../specs/NativePaywallscreenPresenter', () => ({
  __esModule: true,
  default: {},
}));

const native = NativeApphudSdk as jest.Mocked<typeof NativeApphudSdk>;
const user = { userId: 'test-A', subscriptions: [], purchases: [] };

beforeEach(() => {
  jest.resetAllMocks();
  native.start.mockResolvedValue(user);
  native.startManually.mockResolvedValue(user);
});

it('defaults to V1 without changing the caller options', async () => {
  const options: StartProperties = { apiKey: 'test-key' };
  await expect(ApphudSdk.start(options)).resolves.toBe(user);
  expect(native.start).toHaveBeenCalledWith({
    ...options,
    identityVersion: 'v1',
  });
  expect(options).toEqual({ apiKey: 'test-key' });
});

it('forwards opt-in V2 to the native start', async () => {
  await ApphudSdk.start({
    apiKey: 'test-key',
    userId: 'test-A',
    identityVersion: 'v2',
  });
  expect(native.start).toHaveBeenCalledWith({
    apiKey: 'test-key',
    userId: 'test-A',
    identityVersion: 'v2',
  });
});

it('preserves legacy device IDs for V1', async () => {
  await ApphudSdk.startManually({
    apiKey: 'test-key',
    deviceId: 'legacy-device',
  });
  expect(native.startManually).toHaveBeenCalledWith({
    apiKey: 'test-key',
    deviceId: 'legacy-device',
    identityVersion: 'v1',
  });
});

it.each(['start', 'startManually'] as const)(
  'rejects host-owned V2 IDs in %s',
  async (method) => {
    await expect(
      ApphudSdk[method]({
        apiKey: 'test-key',
        deviceId: 'host-device',
        identityVersion: 'v2',
      })
    ).rejects.toThrow('deviceId is only supported in V1');
    expect(native.start).not.toHaveBeenCalled();
    expect(native.startManually).not.toHaveBeenCalled();
  }
);

it('allows V2 in the legacy entry point when IDs remain native-owned', async () => {
  await ApphudSdk.startManually({ apiKey: 'test-key', identityVersion: 'v2' });
  expect(native.startManually).toHaveBeenCalledWith({
    apiKey: 'test-key',
    identityVersion: 'v2',
  });
});

it('rejects unknown JS identity versions before initialization', async () => {
  await expect(
    ApphudSdk.start({
      apiKey: 'test-key',
      identityVersion: 'v3',
    } as unknown as StartProperties)
  ).rejects.toThrow('identityVersion must be v1 or v2');
  expect(native.start).not.toHaveBeenCalled();
});

it('preserves null identity getters for native V1', async () => {
  native.installationId.mockResolvedValue(null);
  native.anonymousId.mockResolvedValue(null);
  await expect(ApphudSdk.installationId()).resolves.toBeNull();
  await expect(ApphudSdk.anonymousId()).resolves.toBeNull();
});

it('reads native IDs again after logout, without caching identity in JS', async () => {
  native.installationId.mockResolvedValue('native-installation');
  native.anonymousId
    .mockResolvedValueOnce('native-before')
    .mockResolvedValueOnce('native-after');
  native.logout.mockResolvedValue(undefined);
  // Fixtures describe native responses; the native SDK owns rotation itself.
  await expect(ApphudSdk.installationId()).resolves.toBe('native-installation');
  await expect(ApphudSdk.anonymousId()).resolves.toBe('native-before');
  await ApphudSdk.logout();
  await expect(ApphudSdk.installationId()).resolves.toBe('native-installation');
  await expect(ApphudSdk.anonymousId()).resolves.toBe('native-after');
  expect(native.logout).toHaveBeenCalledWith();
});

it('keeps the deprecated device ID alias delegated to native', async () => {
  native.deviceId.mockResolvedValue('legacy-or-installation-id');
  await expect(ApphudSdk.deviceId()).resolves.toBe('legacy-or-installation-id');
});

it('keeps same-ID Identify requests delegated to native', async () => {
  native.updateUserID.mockResolvedValue(user);
  await ApphudSdk.updateUserID('test-A');
  await ApphudSdk.updateUserID('test-A');
  expect(native.updateUserID).toHaveBeenCalledTimes(2);
});

it('returns the native Restore result including transferred entitlements unchanged', async () => {
  const result = {
    subscriptions: [{ productId: 'transferred-to-B', isActive: true }],
    purchases: [],
  };
  native.restorePurchases.mockResolvedValue(result);
  await expect(ApphudSdk.restorePurchases()).resolves.toBe(result);
  expect(native.restorePurchases).toHaveBeenCalledWith();
});
