import { describe, expect, it } from 'vitest';

import type { MigrationInterface } from '@rosen-bridge/extended-typeorm';

import { mergeDatabaseMigrations } from '../src/migrations';

/** Small migration fixtures exercise identity and ordering without database access. */
class Initial implements MigrationInterface {
  name = 'initial1700000000000';
  /** Complete the unused fixture forward operation. */
  async up() {}
  /** Complete the unused fixture reverse operation. */
  async down() {}
}
class Shared extends Initial {}
class Additional extends Initial {
  name = 'additional1700000000001';
}

describe('mergeDatabaseMigrations', () => {
  /**
   * @target Preserve the exact established constructors and their ordering.
   * @dependencies Pure migration fixtures; no connection or query mocks.
   * @scenario No additional history is supplied.
   * @expected Existing sequence retained and the input array unmodified.
   */
  it('preserves the established history', () => {
    const existing = [Initial, Additional];
    expect(mergeDatabaseMigrations(existing, [])).toEqual(existing);
    expect(existing).toEqual([Initial, Additional]);
  });

  /**
   * @target Avoid duplicate IDs when compatible package histories overlap.
   * @dependencies Distinct fixture constructors sharing the same instance name.
   * @scenario Append an overlapping constructor and one new migration twice.
   * @expected Established implementation wins and the new ID appears once.
   */
  it('deduplicates the consumer-visible instance identity', () => {
    expect(mergeDatabaseMigrations([Initial], [Shared, Additional, Additional])).toEqual([
      Initial,
      Additional,
    ]);
  });

  /**
   * @target Match TypeORM fallback identity for unnamed migration instances.
   * @dependencies Named fixture constructor with no explicit instance name.
   * @scenario Append that same constructor twice.
   * @expected Exactly one fallback identity is registered.
   */
  it('uses the constructor name when the instance omits a name', () => {
    class Unnamed1788340428757 implements MigrationInterface {
      /** Complete the unused fixture forward operation. */
      async up() {}
      /** Complete the unused fixture reverse operation. */
      async down() {}
    }
    expect(mergeDatabaseMigrations([], [Unnamed1788340428757, Unnamed1788340428757])).toEqual([
      Unnamed1788340428757,
    ]);
  });

  /**
   * @target mergeDatabaseMigrations: Match the actual consumer's empty-name fallback.
   * @dependencies Two distinct named constructors with an empty instance name.
   * @scenario Append both migrations and repeat the first constructor.
   * @expected Both fallback identities remain exactly once instead of collapsing to an empty ID.
   */
  it('uses the constructor fallback for an empty instance name', () => {
    class EmptyNamed1788340428758 extends Initial {
      name = '';
    }
    class EmptyNamed1788340428759 extends Initial {
      name = '';
    }
    expect(
      mergeDatabaseMigrations(
        [],
        [EmptyNamed1788340428758, EmptyNamed1788340428759, EmptyNamed1788340428758],
      ),
    ).toEqual([EmptyNamed1788340428758, EmptyNamed1788340428759]);
  });
});
