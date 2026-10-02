import type { MigrationInterface } from '@rosen-bridge/extended-typeorm';

/** Migration constructors registered by the shared database factory. */
export type DatabaseMigration = new () => MigrationInterface;

/** Match TypeORM MigrationExecutor's instance name or constructor fallback. */
const getDatabaseMigrationId = (Migration: DatabaseMigration): string => {
  const migration = new Migration();
  return migration.name || migration.constructor.name;
};

/**
 * Append migrations from a qualified compatible history without duplicate IDs.
 * @param existing Established shared database migration sequence.
 * @param additional Additional package history with verified shared migrations.
 * @returns Existing constructors in order, followed by previously absent IDs.
 * @remarks Shared IDs retain the established implementation. Callers must qualify
 * overlapping histories against their exact package versions before registration.
 */
export const mergeDatabaseMigrations = (
  existing: readonly DatabaseMigration[],
  additional: readonly DatabaseMigration[],
): DatabaseMigration[] => {
  const result = [...existing];
  const ids = new Set(existing.map(getDatabaseMigrationId));
  for (const migration of additional) {
    const id = getDatabaseMigrationId(migration);
    if (!ids.has(id)) {
      result.push(migration);
      ids.add(id);
    }
  }
  return result;
};
