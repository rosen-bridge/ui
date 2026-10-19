import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

/**
 * source tables of the event list view; `block_entity` is skipped as it is
 * written too often and its rows never change
 */
const SOURCE_TABLES = [
  'observation_entity',
  'event_trigger_entity',
  'aggregated_status_entity',
  'token_entity',
];

/**
 * notify `event_list_view_refresh` when rows of the source tables change;
 * statements that change no rows do not notify
 */
export class Migration1792259579002 implements MigrationInterface {
  name = 'Migration1792259579002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION "notify_event_list_view_refresh"() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        PERFORM pg_notify('event_list_view_refresh', TG_TABLE_NAME);
        RETURN NULL;
      END
      $$
    `);
    for (const table of SOURCE_TABLES) {
      await queryRunner.query(`
        CREATE TRIGGER "event_list_view_refresh"
        AFTER INSERT OR DELETE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION "notify_event_list_view_refresh"()
      `);
      await queryRunner.query(`
        CREATE TRIGGER "event_list_view_refresh_update"
        AFTER UPDATE ON "${table}"
        FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*)
        EXECUTE FUNCTION "notify_event_list_view_refresh"()
      `);
      await queryRunner.query(`
        CREATE TRIGGER "event_list_view_refresh_truncate"
        AFTER TRUNCATE ON "${table}"
        FOR EACH STATEMENT EXECUTE FUNCTION "notify_event_list_view_refresh"()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of SOURCE_TABLES) {
      await queryRunner.query(`
        DROP TRIGGER "event_list_view_refresh_truncate" ON "${table}"
      `);
      await queryRunner.query(`
        DROP TRIGGER "event_list_view_refresh_update" ON "${table}"
      `);
      await queryRunner.query(`
        DROP TRIGGER "event_list_view_refresh" ON "${table}"
      `);
    }
    await queryRunner.query(`
      DROP FUNCTION "notify_event_list_view_refresh"()
    `);
  }
}
