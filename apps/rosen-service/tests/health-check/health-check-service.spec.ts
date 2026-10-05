import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthStatusLevel } from '@rosen-bridge/health-check';
import { ScannerSyncHealthCheckParam } from '@rosen-bridge/scanner-sync-check';

import service from '../../src/health-check/health-check-service';

const state = vi.hoisted(() => ({
  enabled: true,
  registries: [] as import('@rosen-bridge/health-check').HealthCheck[],
  read: vi.fn(),
  bitcoinCash: vi.fn(),
  logger: { child: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('@rosen-bridge/abstract-logger', async (importOriginal) => {
  const original = await importOriginal<typeof import('@rosen-bridge/abstract-logger')>();
  state.logger.child.mockReturnValue(state.logger);
  return { ...original, DefaultLogger: { getInstance: () => state.logger } };
});
vi.mock('@rosen-bridge/health-check', async (importOriginal) => {
  const original = await importOriginal<typeof import('@rosen-bridge/health-check')>();
  class ObservedHealthCheck extends original.HealthCheck {
    /** Captures the real registry and observes its original registration method. */
    constructor(...args: ConstructorParameters<typeof original.HealthCheck>) {
      super(...args);
      vi.spyOn(this, 'register');
      state.registries.push(this);
    }
  }
  return { ...original, HealthCheck: ObservedHealthCheck };
});
vi.mock('../../src/configs', () => ({
  default: {
    get bitcoinCash() {
      return state.enabled ? { enabled: true } : { enabled: false };
    },
    notification: { discordWebHookUrl: '' },
    healthCheck: {
      bitcoinCashScannerWarnDiff: 3,
      bitcoinCashScannerCriticalDiff: 6,
      warnLogAllowedCount: 10,
      errorLogAllowedCount: 10,
      logDuration: 60,
      updateInterval: 60,
      reportPath: 'unused-health-report.json',
      ergoScannerWarnDiff: 3,
      ergoScannerCriticalDiff: 6,
      cardanoScannerWarnDiff: 3,
      cardanoScannerCriticalDiff: 6,
      bitcoinScannerWarnDiff: 3,
      bitcoinScannerCriticalDiff: 6,
      dogeScannerWarnDiff: 3,
      dogeScannerCriticalDiff: 6,
      ethereumScannerWarnDiff: 3,
      ethereumScannerCriticalDiff: 6,
      binanceScannerWarnDiff: 3,
      binanceScannerCriticalDiff: 6,
      firoScannerWarnDiff: 3,
      firoScannerCriticalDiff: 6,
      handshakeScannerWarnDiff: 3,
      handshakeScannerCriticalDiff: 6,
    },
  },
}));
vi.mock('../../src/scanner/scanner-service', () => ({
  default: {
    getErgoScanner: () => ({ name: () => 'ergo' }),
    getCardanoScanner: () => ({ name: () => 'cardano' }),
    getBitcoinScanner: () => ({ name: () => 'bitcoin' }),
    getDogeScanner: () => ({ name: () => 'doge' }),
    getEthereumScanner: () => ({ name: () => 'ethereum' }),
    getBinanceScanner: () => ({ name: () => 'binance' }),
    getFiroScanner: () => ({ name: () => 'firo' }),
    getHandshakeScanner: () => ({ name: () => 'handshake' }),
    getBitcoinCashScanner: state.bitcoinCash,
  },
}));
vi.mock('../../src/health-check/health-check-utils', () => ({ getLastSavedBlock: state.read }));

describe('healthCheckService', () => {
  describe('start', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-02T00:00:00Z'));
      state.enabled = true;
      state.registries.length = 0;
      state.logger.child.mockReturnValue(state.logger);
      state.bitcoinCash.mockReturnValue({ name: () => 'bitcoin-cash' });
      state.read.mockResolvedValue({ height: 1, timestamp: Date.now() / 1000 });
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    /**
     * @target healthCheckService.start registers the initialized BCH scanner
     * and binds its persistence reader
     * @dependencies Controlled scanner identities/config/reader; real BCH factory and HealthCheck.
     * @scenario Start with an initialized BCH getter while the report timer is held.
     * @expected Exactly one registered BCH parameter reads only BCH state and preserves legacy checks.
     */
    it('registers the initialized BCH scanner and binds its persistence reader', async () => {
      await service.start();
      expect(state.logger.error).not.toHaveBeenCalled();
      expect(state.registries).toHaveLength(1);
      const registry = state.registries[0];
      const check = registry.getParamById('bitcoin-cash_scanner');
      expect(check).toBeInstanceOf(ScannerSyncHealthCheckParam);
      expect(registry.register).toHaveBeenCalledTimes(11);
      expect(registry.register).toHaveBeenCalledWith(check);
      expect(state.bitcoinCash).toHaveBeenCalledTimes(1);
      expect(state.read).not.toHaveBeenCalled();
      await registry.updateParam('bitcoin-cash_scanner');
      expect(state.read).toHaveBeenCalledExactlyOnceWith('bitcoin-cash');
      expect(check?.getHealthStatus()).toEqual(HealthStatusLevel.HEALTHY);
      expect(registry.getParamById('bitcoin_scanner')).toBeDefined();
      expect(registry.getParamById('ergo_scanner')).toBeDefined();
      expect(vi.getTimerCount()).toEqual(1);
    });

    /**
     * @target healthCheckService.start omits disabled BCH health without
     * changing the existing checks
     * @dependencies Controlled disabled config/getter and reader; real registry and BCH factory.
     * @scenario Start without a BCH scanner while all eight legacy identities remain available.
     * @expected No BCH registration or persistence read; ten legacy/log checks and one held timer remain.
     */
    it('omits disabled BCH health without changing the existing checks', async () => {
      state.enabled = false;
      state.bitcoinCash.mockReturnValue(undefined);
      await service.start();
      expect(state.logger.error).not.toHaveBeenCalled();
      expect(state.registries).toHaveLength(1);
      const registry = state.registries[0];
      expect(registry.getParamById('bitcoin-cash_scanner')).toBeUndefined();
      expect(registry.register).toHaveBeenCalledTimes(10);
      expect(state.bitcoinCash).toHaveBeenCalledTimes(1);
      await registry.updateParam('bitcoin-cash_scanner');
      expect(state.read).not.toHaveBeenCalled();
      for (const name of [
        'ergo',
        'cardano',
        'bitcoin',
        'doge',
        'ethereum',
        'binance',
        'firo',
        'handshake',
      ])
        expect(registry.getParamById(`${name}_scanner`)).toBeDefined();
      expect(vi.getTimerCount()).toEqual(1);
    });
  });
});
