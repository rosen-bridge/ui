import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1768483786296 implements MigrationInterface {
  name = 'Migration1768483786296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_user_event_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "count" integer NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0),
                CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_user_event_entity"("id", "fromAddress", "toAddress", "count")
            SELECT "id",
                "fromAddress",
                "toAddress",
                "count"
            FROM "user_event_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "user_event_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_user_event_entity"
                RENAME TO "user_event_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_event_entity"
                RENAME TO "temporary_user_event_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "user_event_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "count" integer NOT NULL,
                CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "user_event_entity"("id", "fromAddress", "toAddress", "count")
            SELECT "id",
                "fromAddress",
                "toAddress",
                "count"
            FROM "temporary_user_event_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_user_event_entity"
        `);
  }
}
