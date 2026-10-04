import { randomUUID } from 'node:crypto';

import { DataSource } from '@rosen-bridge/extended-typeorm';
import { getDataSource } from '@rosen-ui/data-source';

import { registerBitcoinCashDataSource } from '../../src/bitcoin-cash/data-source';

export type DatabaseIdentity = { name: string; oid: string; marker: string | null };

/** Refuses cleanup or migration when the created database identity has changed. */
export const assertOwnedDatabase = (
  actual: DatabaseIdentity | undefined,
  expected: DatabaseIdentity,
) => {
  if (
    !actual ||
    actual.name !== expected.name ||
    actual.oid !== expected.oid ||
    actual.marker !== expected.marker
  ) {
    throw Error('PostgreSQL test database ownership check failed');
  }
};

/**
 * Creates a fresh database because legacy migrations explicitly address public.
 * The supplied database is used only as an administrative connection.
 */
export const createPostgresFixture = async (connectionUrl: string) => {
  const url = new URL(connectionUrl);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.search || url.hash) {
    throw Error('PostgreSQL test URL must use postgres/postgresql without query or fragment');
  }
  const name = `rosen_ui_test_${randomUUID().replaceAll('-', '')}`;
  const marker = `rosen-ui-test:${randomUUID()}`;
  const extra = {
    max: 1,
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,
    query_timeout: 20000,
  };
  const admin = new DataSource({ type: 'postgres', url: connectionUrl, synchronize: false, extra });
  const sources = new Set<ReturnType<typeof getDataSource>>();
  let identity: DatabaseIdentity | undefined;
  let created = false;

  /** Reads cluster-owned catalog identity without trusting a connection URL alone. */
  const readIdentity = async (source: DataSource) => {
    const rows = await source.query<DatabaseIdentity[]>(
      `SELECT datname AS name, oid::text AS oid, shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname = $1`,
      [name],
    );
    return rows[0];
  };

  /** Closes only fixture clients, then drops only the exact database created here. */
  const close = async () => {
    try {
      const closed = await Promise.allSettled(
        [...sources].map(async (source) => {
          if (source.isInitialized) await source.destroy();
        }),
      );
      if (closed.some((result) => result.status === 'rejected'))
        throw Error('PostgreSQL test connections could not all close; refusing database cleanup');
      if (created) {
        if (!identity)
          throw Error('PostgreSQL test database identity was not established; refusing cleanup');
        assertOwnedDatabase(await readIdentity(admin), identity);
        await admin.query(`DROP DATABASE "${name}"`);
        created = false;
        if (await readIdentity(admin)) throw Error('PostgreSQL test database still exists');
      }
    } finally {
      if (admin.isInitialized) await admin.destroy();
    }
  };

  try {
    await admin.initialize();
    if (await readIdentity(admin)) throw Error('PostgreSQL test database already exists');
    await admin.query(`CREATE DATABASE "${name}"`);
    created = true;
    const createdIdentity = await readIdentity(admin);
    if (!createdIdentity || createdIdentity.marker !== null)
      throw Error('PostgreSQL test database creation identity is unexpected');
    identity = { ...createdIdentity, marker };
    await admin.query(`COMMENT ON DATABASE "${name}" IS '${marker}'`);
    assertOwnedDatabase(await readIdentity(admin), identity);
    url.pathname = `/${name}`;
  } catch (error) {
    await close();
    throw error;
  }

  /** Verifies the actual connection and database identity before migrations or CRUD. */
  const verify = async (source: DataSource) => {
    if (!identity) throw Error('PostgreSQL test database identity is absent');
    const [current] = await source.query<{ name: string; schema: string }[]>(
      'SELECT current_database() AS name, current_schema() AS schema',
    );
    if (current?.name !== name || current.schema !== 'public')
      throw Error('PostgreSQL test connected to an unexpected database/schema');
    assertOwnedDatabase(await readIdentity(source), identity);
  };

  /** Uses the maintained factory and verifies its connection before any migration. */
  const connect = async (bitcoinCash = false) => {
    const source = getDataSource(url.toString(), false, false);
    if (bitcoinCash) registerBitcoinCashDataSource(source);
    source.setOptions({ extra: { ...extra, options: '-c search_path=public' } });
    sources.add(source);
    await source.initialize();
    await verify(source);
    return source;
  };
  return { connect, verify, close };
};
