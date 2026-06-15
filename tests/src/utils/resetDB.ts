import { command } from './command';

export const resetDB = async () => {
  await command(`echo "BEGIN;
  TRUNCATE TABLE tx_entity RESTART IDENTITY CASCADE;
  TRUNCATE TABLE aggregated_status_entity;
  TRUNCATE TABLE aggregated_status_changed_entity;
  TRUNCATE TABLE guard_status_changed_entity;
  TRUNCATE TABLE guard_status_entity;
  COMMIT;" | psql -p 5432 -U postgres -d public_status_test`);

  await new Promise((r) => setTimeout(r, 1000));
};
