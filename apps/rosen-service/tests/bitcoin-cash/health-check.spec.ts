import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthStatusLevel } from '@rosen-bridge/health-check';

import type { EnabledBitcoinCashConfig } from '../../src/bitcoin-cash/config';
import { createBitcoinCashScannerHealthCheck } from '../../src/bitcoin-cash/health-check';

/** Mutable constant exports let each test isolate the actual health-time consumer. */
const timing = vi.hoisted(() => ({ blockTime: 600, scannerInterval: 600000 }));
vi.mock('../../src/constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/constants')>()),
  get BITCOIN_CASH_BLOCK_TIME() {
    return timing.blockTime;
  },
  get BITCOIN_CASH_SCANNER_INTERVAL() {
    return timing.scannerInterval;
  },
}));

/** Enabled fixture with second-based health age thresholds and explicit ports. */
const options: EnabledBitcoinCashConfig = {
  enabled: true,
  lockAddress: 'unused by health',
  initialHeight: 0,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  cleanup: { thresholdSeconds: 86400, trimCount: 100 },
  commitment: { address: 'unused by health', rwt: '11'.repeat(32) },
  eventTrigger: { address: 'unused', permitAddress: 'unused', fraudAddress: 'unused' },
  electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
  calculatorAddresses: [],
};
/** Inert initialized scanner identity used to bind BCH-only persistence reads. */
const scanner = { name: () => 'bitcoin-cash' };
/** Global health configuration used with the unchanged ten-minute scanner cadence. */
const healthCheck = { bitcoinCashScannerWarnDiff: 3, bitcoinCashScannerCriticalDiff: 6 };

describe('createBitcoinCashScannerHealthCheck', () => {
  beforeEach(() => {
    timing.blockTime = 600;
    timing.scannerInterval = 600000;
  });
  afterEach(() => vi.useRealTimers());

  /**
   * @target createBitcoinCashScannerHealthCheck skips health while disabled
   * @dependencies Mock last-block reader.
   * @scenario Build health from disabled configuration with no scanner.
   * @expected No parameter and no persistence call.
   */
  it('skips health while disabled', () => {
    const read = vi.fn();
    expect(
      createBitcoinCashScannerHealthCheck({ enabled: false }, {}, undefined, read),
    ).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });

  /**
   * @target createBitcoinCashScannerHealthCheck rejects unavailable BCH
   * identity %#
   * @dependencies Missing or wrong scanner identity.
   * @scenario Construct health after failed startup or with a Bitcoin scanner.
   * @expected Reject instead of reporting a healthy unrelated chain.
   */
  it.each([undefined, { name: () => 'bitcoin' }])(
    'rejects unavailable BCH identity %#',
    (candidate) => {
      expect(() =>
        createBitcoinCashScannerHealthCheck(options, healthCheck, candidate, vi.fn()),
      ).toThrow('Enabled BCH scanner is unavailable');
    },
  );

  /**
   * @target createBitcoinCashScannerHealthCheck uses second-based age %i
   * @dependencies Real ScannerSyncHealthCheckParam; mock persisted BCH block.
   * @scenario Independently age the last block through healthy, warning and critical second-based thresholds.
   * @expected Corresponding status at exact boundaries and only BCH persistence identity.
   */
  it.each([
    [1799, HealthStatusLevel.HEALTHY],
    [1800, HealthStatusLevel.UNSTABLE],
    [3600, HealthStatusLevel.BROKEN],
  ])('uses second-based age %i', async (age, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
    const read = vi.fn(async () => ({ height: 800000, timestamp: Date.now() / 1000 - age }));
    const check = createBitcoinCashScannerHealthCheck(options, healthCheck, scanner, read);
    await check?.update();
    expect(check?.getId()).toEqual('bitcoin-cash_scanner');
    expect(check?.getHealthStatus()).toEqual(expected);
    expect(read).toHaveBeenCalledWith('bitcoin-cash');
  });

  /**
   * @target createBitcoinCashScannerHealthCheck uses the injected block time at age %i
   * @dependencies Real health parameter; controlled block-time constant and persisted block age.
   * @scenario Change only BCH block time to 900 seconds and cross its warning and critical ages.
   * @expected Status follows the constant instead of a hard-coded 600-second block time.
   */
  it.each([
    [2699, HealthStatusLevel.HEALTHY],
    [2700, HealthStatusLevel.UNSTABLE],
    [5400, HealthStatusLevel.BROKEN],
  ])('uses the injected block time at age %i', async (age, expected) => {
    timing.blockTime = 900;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T00:00:00Z'));
    const read = vi.fn(async () => ({ height: 800000, timestamp: Date.now() / 1000 - age }));
    const check = createBitcoinCashScannerHealthCheck(options, healthCheck, scanner, read);
    await check?.update();
    expect(check?.getHealthStatus()).toEqual(expected);
  });

  /**
   * @target createBitcoinCashScannerHealthCheck converts the injected scanner interval at age %i
   * @dependencies Real health parameter with its interval multiplier; controlled millisecond constant.
   * @scenario Change only the scanner interval to 2400000 milliseconds and cross its two-interval age.
   * @expected Healthy before 4800 seconds and broken at 4800, proving millisecond-to-second conversion.
   */
  it.each([
    [4799, HealthStatusLevel.HEALTHY],
    [4800, HealthStatusLevel.BROKEN],
  ])('converts the injected scanner interval at age %i', async (age, expected) => {
    timing.scannerInterval = 2400000;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T00:00:00Z'));
    const read = vi.fn(async () => ({ height: 800000, timestamp: Date.now() / 1000 - age }));
    const check = createBitcoinCashScannerHealthCheck(options, healthCheck, scanner, read);
    await check?.update();
    expect(check?.getHealthStatus()).toEqual(expected);
  });

  /**
   * @target createBitcoinCashScannerHealthCheck rejects missing enabled health configuration
   * @dependencies Enabled scanner identity and absent global threshold pair.
   * @scenario Build BCH health without validated global health values.
   * @expected Reject the incomplete consumer input before constructing the parameter.
   */
  it('rejects missing enabled health configuration', () => {
    expect(() => createBitcoinCashScannerHealthCheck(options, {}, scanner, vi.fn())).toThrow(
      'Enabled BCH scanner health configuration is unavailable',
    );
  });
});
