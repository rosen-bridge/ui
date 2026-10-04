import { describe, expect, it } from 'vitest';

import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity, ExtractorStatusEntity } from '@rosen-bridge/abstract-scanner';
import * as extractor from '@rosen-bridge/bitcoin-cash-observation-extractor';
import * as scanner from '@rosen-bridge/bitcoin-cash-scanner';
import type { DataSource, EntityManager, ObjectLiteral } from '@rosen-bridge/extended-typeorm';

import { createPostgresFixture } from './postgresFixture';

const postgresUrl = process.env.ROSEN_UI_TEST_POSTGRES_URL;

describe.skipIf(!postgresUrl)('registerBitcoinCashDataSource PostgreSQL upgrade', () => {
  /**
   * @target registerBitcoinCashDataSource upgrades populated storage and preserves
   * legacy consumers
   * @dependencies actual PostgreSQL, legacy history, and Service-declared BCH packages
   * @scenario Seed legacy rows, upgrade, exercise aliases and uniqueness, roll
   * back DOWN, then reconnect and compare persisted rows and migration history.
   * @expected only migration36 runs, every legacy field survives, aliases support CRUD
   * and one isolated key per alias rejects duplicates with PostgreSQL23505;
   * the new DOWN is rollback-only and reconnect applies no migration again
   */
  it('upgrades populated storage and preserves legacy consumers', async () => {
    const pairs = [
      [BlockEntity, scanner.BitcoinCashBlockEntity],
      [ExtractorStatusEntity, scanner.BitcoinCashExtractorStatusEntity],
      [ObservationEntity, extractor.BitcoinCashObservationEntity],
    ] as const;
    const fixtures = [
      {
        height: 1,
        hash: 'legacy_block',
        parentHash: 'fixture_parent',
        scanner: 'ergo',
        status: 'PROCEED',
        timestamp: 1,
      },
      {
        scannerId: 'ergo',
        extractorId: 'fixture',
        updateHeight: 1,
        updateBlockHash: 'legacy_block',
      },
      {
        fromChain: 'ergo',
        toChain: 'bitcoin-cash',
        fromAddress: 'fixture_from',
        toAddress: 'fixture_to',
        height: 1,
        amount: '100',
        networkFee: '1',
        bridgeFee: '2',
        sourceChainTokenId: 'fixture_source',
        targetChainTokenId: 'fixture_target',
        sourceTxId: 'fixture_tx',
        sourceBlockId: 'legacy_block',
        requestId: 'legacy_request',
        block: 'legacy_block',
        extractor: 'fixture',
      },
    ];
    const database = await createPostgresFixture(postgresUrl!);
    let source: DataSource;
    /** Includes all persisted fields, defaults and generated primary keys. */
    const snapshot = async (manager: DataSource | EntityManager) =>
      Promise.all(
        pairs.map(async ([entity]) =>
          (await manager.getRepository<ObjectLiteral>(entity).find()).map((row) => ({ ...row })),
        ),
      );
    try {
      source = await database.connect();
      expect(await source.runMigrations()).toHaveLength(35);
      for (const [index, [entity]] of pairs.entries())
        await source.getRepository<ObjectLiteral>(entity).insert(fixtures[index]);
      const legacy = await snapshot(source);
      expect(legacy.map((rows) => rows.length)).toEqual([1, 1, 1]);
      expect(legacy[2][0].rawData).toEqual('');
      await source.destroy();
      source = await database.connect(true);
      expect((await source.runMigrations()).map((migration) => migration.name)).toEqual([
        'migration1788340428756',
      ]);
      expect(await snapshot(source)).toEqual(legacy);
      for (const [index, [entity, alias]] of pairs.entries()) {
        expect(source.getMetadata(alias).target).toBe(alias);
        expect(source.getMetadata(alias).tableName).toEqual(source.getMetadata(entity).tableName);
        expect(
          (await source.getRepository<ObjectLiteral>(alias).find()).map((row) => ({ ...row })),
        ).toEqual(legacy[index]);
      }
      const next = [
        { ...fixtures[0], hash: 'bch_block', scanner: 'bitcoin-cash' },
        { ...fixtures[1], scannerId: 'bitcoin-cash', updateBlockHash: 'bch_block' },
        {
          ...fixtures[2],
          fromChain: 'bitcoin-cash',
          toChain: 'ergo',
          requestId: 'bch_request',
          sourceTxId: 'bch_tx',
          block: 'bch_block',
        },
      ];
      const keys = [
        { hash: 'bch_block' },
        { scannerId: 'bitcoin-cash', extractorId: 'fixture' },
        { requestId: 'bch_request', extractor: 'fixture' },
      ];
      const changes = [{ timestamp: 2 }, { updateHeight: 2 }, { amount: '200' }];
      for (const [index, [entity, alias]] of pairs.entries()) {
        const repository = source.getRepository<ObjectLiteral>(alias);
        await repository.insert(next[index]);
        await repository.update(keys[index], changes[index]);
        const updated = await repository.findOneByOrFail(keys[index]);
        expect({ ...updated }).toEqual({
          ...(await source.getRepository<ObjectLiteral>(entity).findOneByOrFail(keys[index])),
        });
        expect(updated).toMatchObject(changes[index]);
        const duplicate =
          index === 0
            ? {
                ...next[index],
                hash: 'duplicate_height_block',
                parentHash: 'duplicate_height_parent',
              }
            : next[index];
        await expect(repository.insert(duplicate)).rejects.toMatchObject({
          code: '23505',
          ...(index === 0 ? { constraint: 'UQ_521d830047d5fe08988538289dd' } : {}),
        });
        await repository.delete(keys[index]);
        expect(
          (await source.getRepository<ObjectLiteral>(entity).find()).map((row) => ({ ...row })),
        ).toEqual(legacy[index]);
      }
      const Migration = scanner.bitcoinCashScannerMigrations.postgres.find(
        (migration) => new migration().name === 'migration1788340428756',
      );
      expect(Migration).toBeDefined();
      const runner = source.createQueryRunner();
      await runner.connect();
      try {
        await runner.startTransaction();
        await new Migration!().down(runner);
        expect(await snapshot(runner.manager)).toEqual(legacy);
      } finally {
        try {
          if (runner.isTransactionActive) await runner.rollbackTransaction();
        } finally {
          await runner.release();
        }
      }
      expect(await source.runMigrations()).toEqual([]);
      expect(await snapshot(source)).toEqual(legacy);
      await source.destroy();
      source = await database.connect(true);
      expect(await source.runMigrations()).toEqual([]);
      expect(await snapshot(source)).toEqual(legacy);
    } finally {
      await database.close();
    }
  }, 60000);
});
