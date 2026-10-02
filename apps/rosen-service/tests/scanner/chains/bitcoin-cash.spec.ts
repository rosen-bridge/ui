import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type EnabledBitcoinCashConfig,
  readBitcoinCashConfig,
} from '../../../src/bitcoin-cash/config';

const mocks = vi.hoisted(() => ({
  network: vi.fn(),
  scanner: vi.fn(),
  addConnector: vi.fn(),
  registerExtractor: vi.fn(),
  startScanner: vi.fn(),
  tokenMap: {},
  dataSource: {},
  extractor: vi.fn(),
  logger: { child: vi.fn() },
}));
vi.mock('@rosen-bridge/abstract-logger', () => ({
  DefaultLogger: { getInstance: () => mocks.logger },
}));
vi.mock('@rosen-bridge/abstract-scanner', () => ({
  FailoverStrategy: class {},
  NetworkConnectorManager: class {
    addConnector = mocks.addConnector;
  },
}));
vi.mock('@rosen-bridge/bitcoin-cash-scanner', () => ({
  BitcoinCashRpcNetwork: class {
    constructor(...args: unknown[]) {
      mocks.network(...args);
    }
  },
  BitcoinCashRpcScanner: class {
    registerExtractor = mocks.registerExtractor;
    constructor(...args: unknown[]) {
      mocks.scanner(...args);
    }
  },
}));
vi.mock('@rosen-bridge/bitcoin-cash-observation-extractor', () => ({
  BitcoinCashRpcObservationExtractor: class {
    constructor(...args: unknown[]) {
      mocks.extractor(...args);
    }
  },
}));
vi.mock('../../../src/configs', () => ({ default: { bitcoinCash: { enabled: false } } }));
vi.mock('../../../src/data-source', () => ({ default: mocks.dataSource }));
vi.mock('../../../src/utils', () => ({ getTokenMap: async () => mocks.tokenMap }));
vi.mock('../../../src/scanner/scanner-utils', () => ({ startScanner: mocks.startScanner }));

import { startBitcoinCashScanner } from '../../../src/scanner/chains/bitcoin-cash';

const options = readBitcoinCashConfig(
  {
    enabled: true,
    lockAddress: 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
    initialHeight: 800000,
    rpc: {
      url: 'https://example.invalid',
      timeoutMs: 10000,
      username: 'operator',
      password: 'synthetic',
    },
    scanner: { intervalMs: 600000, warnDiff: 3, criticalDiff: 6 },
    cleanup: { thresholdSeconds: 86400, trimCount: 100 },
    commitment: {
      address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
      rwt: '11'.repeat(32),
    },
    eventTrigger: {
      address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
      permitAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
      fraudAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    },
    electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
    calculatorAddresses: ['bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a'],
  },
  10,
) as EnabledBitcoinCashConfig;

describe('startBitcoinCashScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logger.child.mockReturnValue(mocks.logger);
    mocks.registerExtractor.mockResolvedValue(undefined);
    mocks.startScanner.mockResolvedValue(undefined);
  });

  /**
   * @target startBitcoinCashScanner: Disabled BCH scanning causes no transport or extractor side effects.
   * @dependencies Mock scanner, RPC connector and lifecycle functions.
   * @scenario Start using the default disabled configuration.
   * @expected Undefined scanner and no client, extractor or interval construction.
   */
  it('does not construct clients while disabled', async () => {
    expect(await startBitcoinCashScanner()).toBeUndefined();
    expect(mocks.network).not.toHaveBeenCalled();
    expect(mocks.scanner).not.toHaveBeenCalled();
    expect(mocks.extractor).not.toHaveBeenCalled();
    expect(mocks.startScanner).not.toHaveBeenCalled();
  });

  /**
   * @target startBitcoinCashScanner: Explicit BCH configuration flows into its RPC scanner and native extractor.
   * @dependencies Mock constructor boundaries and lifecycle functions.
   * @scenario Start with validated operator values under an assigned fixture index.
   * @expected Explicit main chain and millisecond timeout, shared tokens, correct treasury and registration before interval start.
   */
  it('registers native extraction before starting the configured interval', async () => {
    expect(await startBitcoinCashScanner(options)).toBeDefined();
    expect(mocks.network).toHaveBeenCalledWith(options.rpc.url, 10000, 'main', {
      username: 'operator',
      password: 'synthetic',
    });
    expect(mocks.scanner).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: mocks.dataSource, initialHeight: 800000 }),
    );
    expect(mocks.scanner).toHaveBeenCalledWith(
      expect.objectContaining({
        blockCleanupConfig: { blockCleanupThresholdDuration: 86400, blockTrimCountInRound: 100 },
      }),
    );
    expect(mocks.extractor).toHaveBeenCalledWith(
      options.lockAddress,
      mocks.dataSource,
      mocks.tokenMap,
      mocks.logger,
    );
    expect(mocks.registerExtractor).toHaveBeenCalledOnce();
    expect(mocks.startScanner).toHaveBeenCalledWith(expect.anything(), expect.any(String), 600000);
    expect(mocks.registerExtractor.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.startScanner.mock.invocationCallOrder[0],
    );
  });

  /**
   * @target startBitcoinCashScanner: Optional RPC authentication remains absent when not configured.
   * @dependencies Mock connector constructor.
   * @scenario Start with explicit unauthenticated endpoint configuration.
   * @expected Pass undefined auth rather than invented credentials.
   */
  it('does not invent RPC authentication', async () => {
    await startBitcoinCashScanner({ ...options, rpc: { url: options.rpc.url, timeoutMs: 10000 } });
    expect(mocks.network).toHaveBeenCalledWith(options.rpc.url, 10000, 'main', undefined);
  });

  /**
   * @target startBitcoinCashScanner: Failed extractor registration prevents the scanner interval.
   * @dependencies Mock registration rejection.
   * @scenario Reject registration with diagnostic text.
   * @expected Fixed initialization error and no interval start.
   */
  it('rejects failed registration without starting the interval', async () => {
    mocks.registerExtractor.mockRejectedValueOnce(new Error('private diagnostic'));
    await expect(startBitcoinCashScanner(options)).rejects.toThrow(
      /^BCH scanner initialization failed$/,
    );
    expect(mocks.startScanner).not.toHaveBeenCalled();
  });

  /**
   * @target startBitcoinCashScanner: Failed scanner lifecycle initialization does not return an active scanner.
   * @dependencies Mock lifecycle rejection.
   * @scenario Reject initialization after successful registration.
   * @expected Fixed initialization error without provider diagnostic leakage.
   */
  it('rejects failed interval initialization', async () => {
    mocks.startScanner.mockRejectedValueOnce(new Error('private diagnostic'));
    await expect(startBitcoinCashScanner(options)).rejects.toThrow(
      /^BCH scanner initialization failed$/,
    );
  });
});
