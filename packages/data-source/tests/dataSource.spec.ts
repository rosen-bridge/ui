import { beforeEach, describe, expect, it } from 'vitest';

import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import {
  Column,
  Entity,
  type MigrationInterface,
  PrimaryColumn,
} from '@rosen-bridge/extended-typeorm';

import { getDataSource } from '../src/dataSource';

/** Additional metadata identity exercises the optional registration boundary. */
@Entity('fixture_extension')
class AdditionalEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'text' })
  value!: string;
}

/** A new migration is registered without executing its SQL methods. */
class AdditionalMigration implements MigrationInterface {
  name = 'fixture1788340428757';

  /** Complete the unused fixture forward operation. */
  async up() {}

  /** Complete the unused fixture reverse operation. */
  async down() {}
}

/** Build real TypeORM metadata without opening a PostgreSQL connection. */
const buildOnly = async (source: ReturnType<typeof getDataSource>): Promise<void> => {
  await Reflect.get(source, 'buildMetadatas').call(source);
};

describe('getDataSource', () => {
  let source: ReturnType<typeof getDataSource>;
  beforeEach(() => {
    source = getDataSource('postgresql://fixture:fixture@example.invalid/fixture', false, false);
  });

  /**
   * @target getDataSource: Preserve the established disabled-chain storage surface.
   * @dependencies Real PostgreSQL driver and existing entities; no query or connection mocks.
   * @scenario Construct and build metadata without an extension.
   * @expected Existing scanner identity resolves, no additional identity and no connection starts.
   */
  it('preserves existing metadata without opening the database', async () => {
    await buildOnly(source);
    expect(source.getMetadata(BlockEntity).target).toBe(BlockEntity);
    expect(source.hasMetadata(AdditionalEntity)).toEqual(false);
    expect(source.isInitialized).toEqual(false);
    expect(source.options.synchronize).toEqual(false);
  });

  /**
   * @target getDataSource: Register exact optional entity identities alongside legacy consumers.
   * @dependencies Real metadata builder and an additional decorated entity fixture.
   * @scenario Supply the extension while retaining the established entity sequence.
   * @expected Both constructor identities resolve and the additional column metadata is usable.
   */
  it('registers an extension without replacing existing consumers', async () => {
    source = getDataSource('postgresql://fixture:fixture@example.invalid/fixture', true, false, {
      entities: [AdditionalEntity],
      migrations: [],
    });
    await buildOnly(source);
    expect(source.getMetadata(BlockEntity).target).toBe(BlockEntity);
    const metadata = source.getMetadata(AdditionalEntity);
    expect(metadata.target).toBe(AdditionalEntity);
    expect(metadata.tableName).toEqual('fixture_extension');
    expect(metadata.columns.map((column) => column.propertyName)).toEqual(['id', 'value']);
    expect(source.isInitialized).toEqual(false);
  });

  /**
   * @target getDataSource: Register a qualified new migration once without replaying shared history.
   * @dependencies Real migration construction; an established migration constructor and one new fixture.
   * @scenario Extend the history with an overlap and the same new constructor twice.
   * @expected Existing order remains, the new ID appears once and no database is initialized.
   */
  it('merges the qualified migration sequence used by TypeORM', async () => {
    await buildOnly(source);
    const original = source.migrations.map((migration) => migration.name);
    const existing = source.options.migrations as (new () => MigrationInterface)[];
    source = getDataSource('postgresql://fixture:fixture@example.invalid/fixture', false, false, {
      entities: [],
      migrations: [existing[0], AdditionalMigration, AdditionalMigration],
    });
    await buildOnly(source);
    expect(source.migrations.map((migration) => migration.name)).toEqual([
      ...original,
      'fixture1788340428757',
    ]);
    expect(source.isInitialized).toEqual(false);
  });
});
