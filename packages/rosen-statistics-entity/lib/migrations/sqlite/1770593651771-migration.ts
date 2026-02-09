import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770593651771 implements MigrationInterface {
  name = 'Migration1770593651771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" varchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "toChain",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridge_fee_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_bridge_fee_entity"
                RENAME TO "bridge_fee_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0),
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "lastProcessedHeight",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridge_fee_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_bridge_fee_entity"
                RENAME TO "bridge_fee_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0),
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL,
                CONSTRAINT "UQ_1395986621376af58c09efc82a8" UNIQUE ("fromChain", "day", "month", "year")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "lastProcessedHeight",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridge_fee_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_bridge_fee_entity"
                RENAME TO "bridge_fee_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
                RENAME TO "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL DEFAULT (0),
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "lastProcessedHeight",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
                RENAME TO "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" varchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "lastProcessedHeight",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
                RENAME TO "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "bridge_fee_entity"(
                    "id",
                    "fromChain",
                    "toChain",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "lastProcessedHeight",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "temporary_bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_bridge_fee_entity"
        `);
  }
}
