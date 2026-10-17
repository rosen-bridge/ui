import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enabled: false,
  extractor: vi.fn(),
  dataSource: {},
  logger: { child: vi.fn(), debug: vi.fn() },
}));
vi.mock('@rosen-bridge/abstract-logger', () => {
  mocks.logger.child.mockImplementation(() => mocks.logger);
  return { DefaultLogger: { getInstance: () => ({ child: () => mocks.logger }) } };
});
vi.mock('@rosen-bridge/watcher-data-extractor', () => ({
  EventTriggerExtractor: class {
    constructor(
      private id: string,
      ...args: unknown[]
    ) {
      mocks.extractor(id, ...args);
    }
    getId() {
      return this.id;
    }
  },
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
        {
          addresses: {
            eventTrigger: `${chain}-event`,
            permit: `${chain}-permit`,
            fraud: `${chain}-fraud`,
          },
          tokens: { rwt: `${chain}-rwt` },
          explorerUrl: 'https://example.invalid',
        },
      ]),
    ),
    bitcoinCash: {
      get enabled() {
        return mocks.enabled;
      },
      eventTrigger: {
        address: 'bch-event',
        permitAddress: 'bch-permit',
        fraudAddress: 'bch-fraud',
      },
      commitment: { rwt: '11'.repeat(32) },
    },
  },
}));
vi.mock('../../src/data-source', () => ({ default: mocks.dataSource }));

import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { registerExtractors } from '../../src/event-trigger/event-trigger-service';

describe('registerExtractors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enabled = false;
    mocks.logger.child.mockReturnValue(mocks.logger);
  });

  /**
   * @target registerExtractors preserves all nine existing extractors
   * @dependencies Mock persistence and configuration; real registration loop.
   * @scenario Start event-trigger registration with the default disabled branch.
   * @expected Nine original extractor identities with no BCH registration.
   */
  it('preserves all nine existing extractors', async () => {
    const registerExtractor = vi.fn(async () => undefined);
    await registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
      typeof registerExtractors
    >[0]);
    expect(registerExtractor).toHaveBeenCalledTimes(9);
    expect(mocks.extractor.mock.calls.map(([id]) => id)).toEqual([
      'ergo-extractor',
      'cardano-extractor',
      'bitcoin-extractor',
      'bitcoin-runes-extractor',
      'doge-extractor',
      'ethereum-extractor',
      'binance-extractor',
      'firo-extractor',
      'handshake-extractor',
    ]);
  });

  /**
   * @target registerExtractors registers the exact BCH contract and RWT
   * configuration
   * @dependencies Fixture operator config and mocked persistent extractor.
   * @scenario Enable the assigned fixture branch through the real registration loop.
   * @expected Tenth extractor with exact event, permit, fraud and shared RWT fields.
   */
  it('registers the exact BCH contract and RWT configuration', async () => {
    mocks.enabled = true;
    const registerExtractor = vi.fn(async () => undefined);
    await registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
      typeof registerExtractors
    >[0]);
    expect(registerExtractor).toHaveBeenCalledTimes(10);
    expect(mocks.extractor).toHaveBeenLastCalledWith(
      'bitcoin-cash-extractor',
      mocks.dataSource,
      ErgoNetworkType.Explorer,
      'https://example.invalid',
      'bch-event',
      '11'.repeat(32),
      'bch-permit',
      'bch-fraud',
      mocks.logger,
    );
    expect(mocks.logger.debug).toHaveBeenLastCalledWith('event trigger extractors registered', {
      scannerName: 'ergo',
      extractorNames: expect.arrayContaining(['bitcoin-cash-extractor']),
    });
  });

  /**
   * @target registerExtractors fails startup when BCH persistence registration
   * fails
   * @dependencies One rejected persistence call after nine successful registrations.
   * @scenario The enabled BCH extractor cannot be registered.
   * @expected Startup rejection and no completion log.
   */
  it('fails startup when BCH persistence registration fails', async () => {
    mocks.enabled = true;
    const registerExtractor = vi.fn(async (extractor: { getId(): string }) => {
      if (extractor.getId() === 'bitcoin-cash-extractor')
        throw new Error('fixture persistence failure');
    });
    await expect(
      registerExtractors({ registerExtractor, name: () => 'ergo' } as Parameters<
        typeof registerExtractors
      >[0]),
    ).rejects.toThrow('cannot create or register');
    expect(mocks.logger.debug).not.toHaveBeenCalled();
  });
});
