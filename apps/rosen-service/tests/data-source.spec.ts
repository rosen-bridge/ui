import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enabled: false,
  factory: vi.fn(),
  source: {},
  block: class BitcoinCashBlock {},
  status: class BitcoinCashStatus {},
  observation: class BitcoinCashObservation {},
  scannerMigration: class ScannerMigration {},
  observationMigration: class ObservationMigration {},
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
    mocks.factory.mockReturnValue(mocks.source);
  });

  /**
   * @target dataSource: Preserve the existing shared factory when BCH is disabled.
   * @dependencies Mock configuration, package exports and the shared factory.
   * @scenario Load the real service storage module with default disabled BCH.
   * @expected Existing connection options and undefined extension; returned identity preserved.
   */
  it('does not add entity or migration identities while BCH is disabled', async () => {
    const { default: source } = await import('../src/data-source');
    expect(source).toBe(mocks.source);
    expect(mocks.factory).toHaveBeenCalledWith(
      'postgresql://example.invalid/fixture',
      true,
      false,
      undefined,
    );
  });

  /**
   * @target dataSource: Pass the exact BCH package entity identities and migration histories.
   * @dependencies Mock package exports retaining distinct constructors; real service orchestration.
   * @scenario Enable BCH before loading service storage.
   * @expected All three identities and both PostgreSQL histories reach the optional extension.
   */
  it('registers BCH exports alongside the established shared database', async () => {
    mocks.enabled = true;
    await import('../src/data-source');
    expect(mocks.factory).toHaveBeenCalledWith('postgresql://example.invalid/fixture', true, false, {
      entities: [mocks.block, mocks.status, mocks.observation],
      migrations: [mocks.scannerMigration, mocks.observationMigration],
    });
  });

  /**
   * @target dataSource: Preserve the service initialization error boundary.
   * @dependencies Mock factory rejection; real AppError wrapper.
   * @scenario Reject storage construction while BCH is enabled.
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
