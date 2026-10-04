import { describe, expect, it } from 'vitest';

import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity, ExtractorStatusEntity } from '@rosen-bridge/abstract-scanner';
import { BitcoinCashObservationEntity } from '@rosen-bridge/bitcoin-cash-observation-extractor';
import {
  BitcoinCashBlockEntity,
  BitcoinCashExtractorStatusEntity,
} from '@rosen-bridge/bitcoin-cash-scanner';
import { getDataSource } from '@rosen-ui/data-source';

import { registerBitcoinCashDataSource } from '../../src/bitcoin-cash/data-source';

/** Build actual TypeORM metadata without connecting to PostgreSQL. */
const buildOnly = async (source: ReturnType<typeof getDataSource>): Promise<void> => {
  await Reflect.get(source, 'buildMetadatas').call(source);
};

describe('registerBitcoinCashDataSource', () => {
  /**
   * @target registerBitcoinCashDataSource retains legacy metadata and registers
   * BCH aliases before initialization
   * @dependencies Real shared factory and installed BCH entities; no connection.
   * @scenario Build legacy metadata, register BCH, then rebuild metadata.
   * @expected Both constructor identities use their shared tables without connecting.
   */
  it('retains legacy metadata and registers BCH aliases before initialization', async () => {
    const source = getDataSource('postgresql://example.invalid/fixture', false, false);
    await buildOnly(source);
    const original = [...source.entityMetadatas];
    expect(registerBitcoinCashDataSource(source)).toBe(source);
    await buildOnly(source);
    for (const metadata of original)
      expect(source.getMetadata(metadata.target).tableName).toEqual(metadata.tableName);
    for (const [entity, alias] of [
      [BlockEntity, BitcoinCashBlockEntity],
      [ExtractorStatusEntity, BitcoinCashExtractorStatusEntity],
      [ObservationEntity, BitcoinCashObservationEntity],
    ]) {
      expect(source.getMetadata(entity).target).toBe(entity);
      expect(source.getMetadata(alias).target).toBe(alias);
      expect(source.getMetadata(alias).tableName).toEqual(source.getMetadata(entity).tableName);
    }
    expect(source.isInitialized).toEqual(false);
    expect(source.options.synchronize).toEqual(false);
  });

  /**
   * @target registerBitcoinCashDataSource preserves shared migration constructors
   * and adds the BCH migration once
   * @dependencies Real shared and BCH migration histories, built without PostgreSQL.
   * @scenario Register twice and compare migration identities to the baseline.
   * @expected Existing IDs retain their original implementation; repeat registration is stable.
   */
  it('preserves shared migration constructors and adds the BCH migration once', async () => {
    const source = getDataSource('postgresql://example.invalid/fixture', false, false);
    await buildOnly(source);
    const original = [...(source.options.migrations as unknown[])];
    const originalIds = source.migrations.map((migration) => migration.name);
    registerBitcoinCashDataSource(source);
    registerBitcoinCashDataSource(source);
    await buildOnly(source);
    expect((source.options.migrations as unknown[]).slice(0, original.length)).toEqual(original);
    expect(source.migrations.map((migration) => migration.name)).toEqual([
      ...originalIds,
      'migration1788340428756',
    ]);
    expect(new Set(source.options.entities as unknown[]).size).toEqual(
      (source.options.entities as unknown[]).length,
    );
    expect(source.isInitialized).toEqual(false);
  });

  /**
   * @target registerBitcoinCashDataSource rejects registration after database
   * initialization
   * @dependencies Shared factory source with an already initialized flag.
   * @scenario Mark the source initialized, then attempt BCH registration.
   * @expected Options remain unchanged and registration fails before mutation.
   */
  it('rejects registration after database initialization', () => {
    const source = getDataSource('postgresql://example.invalid/fixture', false, false);
    const options = source.options;
    Object.defineProperty(source, 'isInitialized', { value: true });
    expect(() => registerBitcoinCashDataSource(source)).toThrow('before initialization');
    expect(source.options).toBe(options);
  });
});
