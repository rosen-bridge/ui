import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthStatusLevel } from '@rosen-bridge/health-check';

import '../src/bitcoin-cash/config';
import { createBitcoinCashScannerHealthCheck } from '../src/bitcoin-cash/health-check';
import { serviceConfig } from './bitcoin-cash/bitcoinCashTestData';

/** Config-module boundary controlled independently of the production parser. */
const state = vi.hoisted(() => ({
  values: {} as Record<string, unknown>,
  get: vi.fn(),
}));
vi.mock('config', () => ({
  default: {
    has: (key: string) => key in state.values,
    get: (key: string) => {
      state.get(key);
      if (key in state.values) return state.values[key];
      if (key.startsWith('healthCheck.bitcoinCash')) throw new Error('Missing BCH health key');
      return key === 'logs' ? [] : 3;
    },
  },
}));
vi.mock('@rosen-ui/constants', async (importOriginal) => {
  const original = await importOriginal<typeof import('@rosen-ui/constants')>();
  return {
    ...original,
    NETWORKS: {
      ...original.NETWORKS,
      'bitcoin-cash': { ...original.NETWORKS['bitcoin-cash'], index: 10 },
    },
  };
});
// Retain the actual parser between getConfig reloads without reinitializing its dependency graph.
vi.mock('../src/bitcoin-cash/config', async (importOriginal) =>
  importOriginal<typeof import('../src/bitcoin-cash/config')>(),
);

describe('getConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    state.values = {
      'bitcoin-cash': serviceConfig,
      'healthCheck.bitcoinCashScannerWarnDiff': 2,
      'healthCheck.bitcoinCashScannerCriticalDiff': 4,
    };
  });
  afterEach(() => vi.useRealTimers());

  /**
   * @target getConfig binds global BCH thresholds to scanner health at age %i
   * @dependencies Actual config parser and scanner health parameter; controlled node-config and fixture chain index.
   * @scenario Load an enabled profile with nondefault global thresholds and age a persisted BCH block.
   * @expected The real health consumer reports the configured second-based status.
   */
  it.each([
    [1199, HealthStatusLevel.HEALTHY],
    [1200, HealthStatusLevel.UNSTABLE],
    [2400, HealthStatusLevel.BROKEN],
  ])('binds global BCH thresholds to scanner health at age %i', async (age, expected) => {
    const { default: config } = await import('../src/configs');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T00:00:00Z'));
    const read = vi.fn(async () => ({ height: 800000, timestamp: Date.now() / 1000 - age }));
    const check = createBitcoinCashScannerHealthCheck(
      config.bitcoinCash,
      config.healthCheck,
      { name: () => 'bitcoin-cash' },
      read,
    );
    expect(config.bitcoinCash.enabled).toEqual(true);
    expect(config.healthCheck.bitcoinCashScannerWarnDiff).toEqual(2);
    expect(config.healthCheck.bitcoinCashScannerCriticalDiff).toEqual(4);
    await check?.update();
    expect(check?.getHealthStatus()).toEqual(expected);
    expect(read).toHaveBeenCalledExactlyOnceWith('bitcoin-cash');
  });

  /**
   * @target getConfig rejects invalid global BCH threshold %s=%s
   * @dependencies Actual getConfig import and BCH parser; controlled node-config values.
   * @scenario Corrupt one global threshold while all remaining enabled configuration is valid.
   * @expected Service configuration loading fails before scanner health is constructed.
   */
  it.each(
    ['WarnDiff', 'CriticalDiff'].flatMap((suffix) =>
      [undefined, null, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN, Infinity, '3'].map(
        (value) => [`healthCheck.bitcoinCashScanner${suffix}`, value] as const,
      ),
    ),
  )('rejects invalid global BCH threshold %s=%s', async (key, value) => {
    state.values[key] = value;
    await expect(import('../src/configs')).rejects.toThrow(
      'Invalid BCH scanner health configuration',
    );
  });

  /**
   * @target getConfig rejects missing enabled BCH health key %s
   * @dependencies Actual getConfig import; node-config missing-key behavior.
   * @scenario Omit one required global threshold from an otherwise complete enabled profile.
   * @expected Import fails instead of accepting an undefined health threshold.
   */
  it.each(['healthCheck.bitcoinCashScannerWarnDiff', 'healthCheck.bitcoinCashScannerCriticalDiff'])(
    'rejects missing enabled BCH health key %s',
    async (key) => {
      state.values = Object.fromEntries(
        Object.entries(state.values).filter(([name]) => name !== key),
      );
      await expect(import('../src/configs')).rejects.toThrow('Missing BCH health key');
    },
  );

  /**
   * @target getConfig rejects reversed BCH health thresholds
   * @dependencies Actual config loading with otherwise valid enabled profile.
   * @scenario Set the warning difference above the critical difference.
   * @expected Reject the unordered pair using a fixed BCH health error.
   */
  it('rejects reversed BCH health thresholds', async () => {
    state.values['healthCheck.bitcoinCashScannerWarnDiff'] = 5;
    await expect(import('../src/configs')).rejects.toThrow(
      'Invalid BCH scanner health configuration',
    );
  });

  /**
   * @target getConfig accepts equal positive BCH health thresholds
   * @dependencies Actual config loading with positive safe integer thresholds.
   * @scenario Set warning and critical differences to the same value.
   * @expected Preserve the former nondecreasing ordering contract.
   */
  it('accepts equal positive BCH health thresholds', async () => {
    state.values['healthCheck.bitcoinCashScannerWarnDiff'] = 4;
    const { default: config } = await import('../src/configs');
    expect(config.healthCheck.bitcoinCashScannerWarnDiff).toEqual(4);
    expect(config.healthCheck.bitcoinCashScannerCriticalDiff).toEqual(4);
  });

  /**
   * @target getConfig ignores incomplete BCH health values while disabled %s
   * @dependencies Actual parser/getConfig; controlled absence or disabled profile.
   * @scenario Leave BCH disabled or absent and supply malformed optional health values.
   * @expected Disabled config loads without reading or retaining those threshold values.
   */
  it.each([undefined, { enabled: false, scanner: null, rpc: null }])(
    'ignores incomplete BCH health values while disabled %s',
    async (value) => {
      state.values = {
        ...(value === undefined ? {} : { 'bitcoin-cash': value }),
        'healthCheck.bitcoinCashScannerWarnDiff': 'unfinished',
        'healthCheck.bitcoinCashScannerCriticalDiff': null,
      };
      const { default: config } = await import('../src/configs');
      expect(config.bitcoinCash).toEqual({ enabled: false });
      expect(config.healthCheck.bitcoinCashScannerWarnDiff).toBeUndefined();
      expect(config.healthCheck.bitcoinCashScannerCriticalDiff).toBeUndefined();
      expect(state.get).not.toHaveBeenCalledWith('healthCheck.bitcoinCashScannerWarnDiff');
      expect(state.get).not.toHaveBeenCalledWith('healthCheck.bitcoinCashScannerCriticalDiff');
    },
  );
});
