import { afterEach, describe, expect, it, vi } from 'vitest';

import { HealthStatusLevel } from '@rosen-bridge/health-check';

import type { EnabledBitcoinCashConfig } from '../../src/bitcoin-cash/config';
import { createBitcoinCashScannerHealthCheck } from '../../src/bitcoin-cash/health-check';

const options: EnabledBitcoinCashConfig = {
  enabled: true,
  lockAddress: 'unused by health',
  initialHeight: 0,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  scanner: { intervalMs: 600000, warnDiff: 3, criticalDiff: 6 },
  cleanup: { thresholdSeconds: 86400, trimCount: 100 },
  commitment: { address: 'unused by health', rwt: '11'.repeat(32) },
  eventTrigger: { address: 'unused', permitAddress: 'unused', fraudAddress: 'unused' },
  electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
  calculatorAddresses: [],
};
const scanner = { name: () => 'bitcoin-cash' };

describe('createBitcoinCashScannerHealthCheck', () => {
  afterEach(() => vi.useRealTimers());

  /**
   * @target createBitcoinCashScannerHealthCheck: Disabled BCH does not create a health parameter or query persistence.
   * @dependencies Mock last-block reader.
   * @scenario Build health from disabled configuration with no scanner.
   * @expected No parameter and no persistence call.
   */
  it('skips health while disabled', () => {
    const read = vi.fn();
    expect(
      createBitcoinCashScannerHealthCheck({ enabled: false }, undefined, read),
    ).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });

  /**
   * @target createBitcoinCashScannerHealthCheck: Enabled BCH health requires a matching initialized scanner.
   * @dependencies Missing or wrong scanner identity.
   * @scenario Construct health after failed startup or with a Bitcoin scanner.
   * @expected Reject instead of reporting a healthy unrelated chain.
   */
  it.each([undefined, { name: () => 'bitcoin' }])(
    'rejects unavailable BCH identity %#',
    (candidate) => {
      expect(() => createBitcoinCashScannerHealthCheck(options, candidate, vi.fn())).toThrow(
        'Enabled BCH scanner is unavailable',
      );
    },
  );

  /**
   * @target createBitcoinCashScannerHealthCheck: Actual scanner-sync library receives intervals in seconds.
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
    const check = createBitcoinCashScannerHealthCheck(options, scanner, read);
    await check?.update();
    expect(check?.getId()).toEqual('bitcoin-cash_scanner');
    expect(check?.getHealthStatus()).toEqual(expected);
    expect(read).toHaveBeenCalledWith('bitcoin-cash');
  });
});
