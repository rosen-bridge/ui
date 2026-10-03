# Data source

`getDataSource` creates the shared PostgreSQL data source. Callers may supply
qualified additional entity identities and migrations without replacing the
existing storage history.

## PostgreSQL integration test

Install and build the UI workspace first, including Rosen Service's declared
Bitcoin Cash scanner and observation-extractor dependencies. The test resolves
these packages through the Service consumer and runs the maintained data-source
factory against a real PostgreSQL server.

Set `ROSEN_UI_TEST_POSTGRES_URL` to an administrative connection on a dedicated
test server, then run:

```sh
npm run test:postgres --workspace=@rosen-ui/data-source
```

The URL must use `postgres:` or `postgresql:` without query parameters or a
fragment. The role needs permission to create and drop databases. The command
fails when the URL is absent; ordinary `npm test` skips the database case when
it is absent. Never point this fixture at production.

Each run creates a random `rosen_ui_test_` database and checks its name, catalog
OID and nonce before migration and cleanup. A separate schema is insufficient:
the existing PostgreSQL migration history explicitly addresses indexes in
`public`. The fixture closes its connections and drops only its own database,
without forced disconnection. It does not start or stop PostgreSQL. If database
identity cannot be verified, cleanup refuses to drop it.

The test populates all three legacy scanner/observation tables after the 35
existing migrations, enables BCH and checks that only the additional migration
runs. It compares every legacy field, exercises CRUD through all three BCH
aliases, checks three duplicate-key failures, executes the new migration's
`down` inside an always-rolled-back transaction, and reconnects without replaying
migrations. This does not establish rollback safety for the full legacy history.
