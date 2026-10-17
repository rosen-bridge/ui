import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enabled: false,
  factory: vi.fn(),
  source: {
    isInitialized: false,
    options: { entities: [] as unknown[], migrations: [] as unknown[] },
    setOptions: vi.fn(),
  },
  block: class BitcoinCashBlock {},
  status: class BitcoinCashStatus {},
  observation: class BitcoinCashObservation {},
  scannerMigration: class ScannerMigration {
    name = 'scanner1700000000000';
  },
  observationMigration: class ObservationMigration {
    name = 'observation1700000000001';
  },
}));

vi.mock('@rosen-ui/data-source', () => ({ getDataSource: mocks.factory }));
vi.mock('@rosen-bridge/bitcoin-cash-scanner', () => ({
  BitcoinCashBlockEntity: mocks.block,
  BitcoinCashExtractorStatusEntity: mocks.status,
  bitcoinCashScannerMigrations: { postgres: [mocks.scannerMigration] },
}));
vi.mock('@rosen-bridge/bitcoin-cash-observation-extractor', () => ({
  BitcoinCashObservationEntity: mocks.observation,
  bitcoinCashObservationMigrations: { postgres: [mocks.observationMigration] },
}));
vi.mock('../src/configs', () => ({
  default: {
    postgres: { url: 'postgresql://example.invalid/fixture', useSSL: true, logging: false },
    bitcoinCash: {
      get enabled() {
        return mocks.enabled;
      },
    },
  },
}));

describe('dataSource', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.enabled = false;
    mocks.source.options = { entities: [], migrations: [] };
    mocks.source.isInitialized = false;
    mocks.source.setOptions.mockReturnValue(mocks.source);
    mocks.factory.mockReturnValue(mocks.source);
  });

  /**
   * @target dataSource does not add entity or migration identities while BCH is
   * disabled
   * @dependencies Mock configuration, package exports and the shared factory.
   * @scenario Load the Service source with BCH disabled and inspect factory calls.
   * @expected Existing factory arguments and returned identity preserved, no BCH registration.
   */
  it('does not add entity or migration identities while BCH is disabled', async () => {
    const { default: source } = await import('../src/data-source');
    expect(source).toBe(mocks.source);
    expect(mocks.factory).toHaveBeenCalledWith('postgresql://example.invalid/fixture', true, false);
    expect(mocks.source.setOptions).not.toHaveBeenCalled();
  });

  /**
   * @target dataSource registers BCH exports alongside the established shared
   * database
   * @dependencies Mock package exports retaining distinct constructors; real service orchestration.
   * @scenario Enable BCH, load the Service source and inspect registered options.
   * @expected Shared factory arguments remain unchanged; BCH identities are added before initialization.
   */
  it('registers BCH exports alongside the established shared database', async () => {
    mocks.enabled = true;
    const { default: source } = await import('../src/data-source');
    expect(source).toBe(mocks.source);
    expect(mocks.factory).toHaveBeenCalledWith('postgresql://example.invalid/fixture', true, false);
    expect(mocks.source.setOptions).toHaveBeenCalledWith({
      entities: [mocks.block, mocks.status, mocks.observation],
      migrations: [mocks.scannerMigration, mocks.observationMigration],
    });
  });

  /**
   * @target dataSource rejects a failed factory instead of exposing storage
   * @dependencies Mock factory rejection; real AppError wrapper.
   * @scenario Reject factory construction and load the Service source.
   * @expected Module loading fails instead of exporting an initialized storage handle.
   */
  it('rejects a failed factory instead of exposing storage', async () => {
    mocks.enabled = true;
    mocks.factory.mockImplementationOnce(() => {
      throw new Error('fixture metadata registration failed');
    });
    await expect(import('../src/data-source')).rejects.toThrow(
      'cannot create data source due to error: Error: fixture metadata registration failed',
    );
  });
});
