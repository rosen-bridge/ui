import {
  BitcoinCashObservationEntity,
  bitcoinCashObservationMigrations,
} from '@rosen-bridge/bitcoin-cash-observation-extractor';
import {
  BitcoinCashBlockEntity,
  BitcoinCashExtractorStatusEntity,
  bitcoinCashScannerMigrations,
} from '@rosen-bridge/bitcoin-cash-scanner';
import type { DataSource, MigrationInterface } from '@rosen-bridge/extended-typeorm';

/**
 * Register BCH's storage identities before the service initializes its database.
 * @param source Uninitialized source returned by the shared PostgreSQL factory.
 * @returns The same source with BCH aliases and its additional migration history.
 * @remarks Shared migration IDs retain the established implementation. The BCH
 * package histories must remain compatible with the service's pinned history.
 */
export const registerBitcoinCashDataSource = (source: DataSource): DataSource => {
  if (source.isInitialized) throw Error('BCH storage must be registered before initialization');
  if (!Array.isArray(source.options.entities) || !Array.isArray(source.options.migrations))
    throw Error('BCH storage requires the shared factory entity and migration arrays');
  if (source.options.migrations.some((migration) => typeof migration !== 'function'))
    throw Error('BCH storage requires migration constructors from the shared factory');

  const entities = [...source.options.entities];
  for (const entity of [
    BitcoinCashBlockEntity,
    BitcoinCashExtractorStatusEntity,
    BitcoinCashObservationEntity,
  ]) {
    if (!entities.includes(entity)) entities.push(entity);
  }
  const migrations = [...source.options.migrations] as (new () => MigrationInterface)[];
  const ids = new Set(
    migrations.map((Migration) => {
      const migration = new Migration();
      return migration.name || migration.constructor.name;
    }),
  );
  for (const Migration of [
    ...bitcoinCashScannerMigrations.postgres,
    ...bitcoinCashObservationMigrations.postgres,
  ]) {
    const migration = new Migration();
    const id = migration.name || migration.constructor.name;
    if (!ids.has(id)) {
      migrations.push(Migration);
      ids.add(id);
    }
  }
  return source.setOptions({ entities, migrations });
};
