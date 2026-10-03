import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  keys: [
    'ergo',
    'cardano',
    'bitcoin',
    'bitcoin-runes',
    'ethereum',
    'binance',
    'doge',
    'firo',
    'handshake',
  ],
  enabled: false,
  extractor: vi.fn(),
  tokenMap: {},
  dataSource: {},
  logger: { child: vi.fn(), debug: vi.fn() },
}));
vi.mock('@rosen-bridge/abstract-logger', () => ({
  DefaultLogger: { getInstance: () => ({ child: () => mocks.logger }) },
}));
vi.mock('@rosen-bridge/watcher-data-extractor', () => ({
  CommitmentExtractor: class {
    constructor(...args: unknown[]) {
      mocks.extractor(...args);
    }
  },
}));
vi.mock('@rosen-ui/constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@rosen-ui/constants')>()),
  NETWORKS_KEYS: mocks.keys,
}));
vi.mock('../../src/configs', () => ({
  default: {
    ...Object.fromEntries(
      [
        'ergo',
        'cardano',
        'bitcoin',
        'bitcoinRunes',
        'ethereum',
        'binance',
        'doge',
        'firo',
        'handshake',
      ].map((chain) => [
        chain,
        { addresses: { commitment: `${chain}-fixture` }, tokens: { rwt: `${chain}-rwt-fixture` } },
      ]),
    ),
    bitcoinCash: {
      get enabled() {
        return mocks.enabled;
      },
      commitment: { address: 'bch-ergo-fixture', rwt: '11'.repeat(32) },
    },
  },
}));
vi.mock('../../src/data-source', () => ({ default: mocks.dataSource }));
vi.mock('../../src/utils', () => ({ getTokenMap: async () => mocks.tokenMap }));

import { registerExtractors } from '../../src/commitment/commitment-service';

describe('registerExtractors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enabled = false;
    mocks.keys.splice(
      0,
      mocks.keys.length,
      'ergo',
      'cardano',
      'bitcoin',
      'bitcoin-runes',
      'ethereum',
      'binance',
      'doge',
      'firo',
      'handshake',
    );
    mocks.logger.child.mockReturnValue(mocks.logger);
  });

  /**
   * @target registerExtractors: Existing commitment registration remains unchanged while BCH is unassigned.
   * @dependencies Mock persistent extractor and original operational network keys.
   * @scenario Register through the real commitment-service loop with BCH absent.
   * @expected Nine previous extractors, including the Bitcoin Runes configuration alias.
   */
  it('preserves existing commitment consumers', async () => {
    const registerExtractor = vi.fn(async () => undefined);
    await registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
      typeof registerExtractors
    >[0]);
    expect(registerExtractor).toHaveBeenCalledTimes(9);
    expect(mocks.extractor.mock.calls.map(([id]) => id)).toEqual([
      'ergo-commitment-extractor',
      'cardano-commitment-extractor',
      'bitcoin-commitment-extractor',
      'bitcoinRunes-commitment-extractor',
      'ethereum-commitment-extractor',
      'binance-commitment-extractor',
      'doge-commitment-extractor',
      'firo-commitment-extractor',
      'handshake-commitment-extractor',
    ]);
  });

  /**
   * @target registerExtractors: Assignment alone does not enable BCH commitment scanning.
   * @dependencies Fixture assigned key and disabled BCH configuration.
   * @scenario Include BCH in operational fixture keys without operator enablement.
   * @expected Nine previous extractors and no BCH registration.
   */
  it('skips an assigned fixture chain while BCH remains disabled', async () => {
    mocks.keys.push('bitcoin-cash');
    const registerExtractor = vi.fn(async () => undefined);
    await registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
      typeof registerExtractors
    >[0]);
    expect(registerExtractor).toHaveBeenCalledTimes(9);
  });

  /**
   * @target registerExtractors: Enabled assigned BCH uses its explicit Ergo-side commitment address and RWT.
   * @dependencies Fixture assignment, operator values and mocked persistent extractor.
   * @scenario Register the optional BCH commitment through the real service loop.
   * @expected One additional extractor with BCH identity and exact operator fields.
   */
  it('registers BCH with the configured Ergo commitment and RWT', async () => {
    mocks.keys.push('bitcoin-cash');
    mocks.enabled = true;
    const registerExtractor = vi.fn(async () => undefined);
    await registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
      typeof registerExtractors
    >[0]);
    expect(registerExtractor).toHaveBeenCalledTimes(10);
    expect(mocks.extractor).toHaveBeenLastCalledWith(
      'bitcoin-cash-commitment-extractor',
      ['bch-ergo-fixture'],
      '11'.repeat(32),
      mocks.dataSource,
      mocks.tokenMap,
      mocks.logger,
    );
  });
});
