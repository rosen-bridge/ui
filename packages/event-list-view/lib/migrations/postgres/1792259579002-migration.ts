import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

/**
 * tables whose changes refresh the event list view
 */
const SOURCE_TABLES = ['observation_entity', 'event_trigger_entity', 'aggregated_status_entity'];

/**
 * notify `event_list_view_refresh` on every insert, update and delete of the
 * source tables, except updates that leave a row unchanged
 */
export class Migration1792259579002 implements MigrationInterface {
  name = 'Migration1792259579002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION "notify_event_list_view_refresh"() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        IF TG_OP = 'UPDATE' AND OLD::text = NEW::text THEN
          RETURN NULL;
        END IF;
        PERFORM pg_notify('event_list_view_refresh', TG_TABLE_NAME);
        RETURN NULL;
      END
      $$
    `);
    for (const table of SOURCE_TABLES) {
      await queryRunner.query(`
        CREATE TRIGGER "event_list_view_refresh"
        AFTER INSERT OR UPDATE OR DELETE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION "notify_event_list_view_refresh"()
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of SOURCE_TABLES) {
      await queryRunner.query(`
        DROP TRIGGER "event_list_view_refresh" ON "${table}"
      `);
    }
    await queryRunner.query(`
      DROP FUNCTION "notify_event_list_view_refresh"()
    `);
  }
}
