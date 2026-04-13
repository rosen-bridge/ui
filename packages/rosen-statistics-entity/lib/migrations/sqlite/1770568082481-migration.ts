import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770568082481 implements MigrationInterface {
  name = 'Migration1770568082481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
			CREATE TABLE "temporary_watcher_count_entity" (
				"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
				"network" varchar NOT NULL,
				"count" integer NOT NULL,
				CONSTRAINT "UQ_66fea9a466ee440bde9b6c1b31a" UNIQUE ("network")
			)
		`);

    await queryRunner.query(`
			INSERT INTO "temporary_watcher_count_entity" ("id", "network", "count")
			SELECT "id", "network", "count"
			FROM "watcher_count_entity"
		`);

    await queryRunner.query(`DROP TABLE "watcher_count_entity"`);

    await queryRunner.query(`
			ALTER TABLE "temporary_watcher_count_entity"
			RENAME TO "watcher_count_entity"
		`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
			CREATE TABLE "temporary_watcher_count_entity" (
				"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
				"network" varchar NOT NULL,
				"count" integer NOT NULL
			)
		`);

    await queryRunner.query(`
			INSERT INTO "temporary_watcher_count_entity" ("id", "network", "count")
			SELECT "id", "network", "count"
			FROM "watcher_count_entity"
		`);

    await queryRunner.query(`DROP TABLE "watcher_count_entity"`);

    await queryRunner.query(`
			ALTER TABLE "temporary_watcher_count_entity"
			RENAME TO "watcher_count_entity"
		`);
  }
}
