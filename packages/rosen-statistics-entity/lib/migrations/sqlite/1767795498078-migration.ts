import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1767795498078 implements MigrationInterface {
  name = 'Migration1767795498078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain"
            FROM "event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_count_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_count_entity"
                RENAME TO "event_count_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0)
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain"
            FROM "event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_count_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_count_entity"
                RENAME TO "event_count_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0),
                CONSTRAINT "UQ_035b3c112fd24e7f006ea8fe622" UNIQUE ("status", "fromChain", "toChain")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain",
                    "lastProcessedHeight"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain",
                "lastProcessedHeight"
            FROM "event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_count_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_event_count_entity"
                RENAME TO "event_count_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
                RENAME TO "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0)
            )
        `);
    await queryRunner.query(`
            INSERT INTO "event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain",
                    "lastProcessedHeight"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain",
                "lastProcessedHeight"
            FROM "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
                RENAME TO "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain"
            FROM "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
                RENAME TO "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                CONSTRAINT "UQ_e22fe0587a24002c52e84a6c4d1" UNIQUE ("fromChain", "toChain")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "event_count_entity"(
                    "id",
                    "eventCount",
                    "status",
                    "fromChain",
                    "toChain"
                )
            SELECT "id",
                "eventCount",
                "status",
                "fromChain",
                "toChain"
            FROM "temporary_event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_event_count_entity"
        `);
  }
}
