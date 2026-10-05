import { describe, expect, it } from 'vitest';

import { assertOwnedDatabase, createPostgresFixture } from './postgresTestUtils';

describe('assertOwnedDatabase', () => {
  /**
   * @target assertOwnedDatabase rejects mismatched %s
   * @dependencies catalog identity fixtures without a database connection
   * @scenario Independently change the database name, OID or ownership marker.
   * @expected each isolated mismatch prevents migration or cleanup authorization
   */
  it.each(['name', 'oid', 'marker'] as const)('rejects mismatched %s', (field) => {
    const identity = { name: 'rosen_ui_test_fixture', oid: '1', marker: 'nonce' };
    expect(() => assertOwnedDatabase({ ...identity, [field]: 'different' }, identity)).toThrow(
      'ownership check failed',
    );
  });
});

describe('createPostgresFixture', () => {
  /**
   * @target createPostgresFixture refuses database overrides in connection URL
   * parameters
   * @dependencies invalid connection URL, no PostgreSQL connection
   * @scenario Supply a connection URL containing a database override parameter.
   * @expected configuration is rejected before connection or DDL
   */
  it('refuses database overrides in connection URL parameters', async () => {
    await expect(createPostgresFixture('postgresql://localhost/test?dbname=other')).rejects.toThrow(
      'without query or fragment',
    );
  });
});
