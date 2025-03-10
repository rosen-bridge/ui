import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741521346209 implements MigrationInterface {
  name = 'Migration1741521346209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "guard_status_entity" (
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_entity" (
                "eventId" varchar PRIMARY KEY NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tx_entity" (
                "txId" varchar PRIMARY KEY NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "txType" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "guard_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde" ON "guard_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_49046f1dba53192a374f5fad91" ON "guard_status_changed_entity" ("guardPk")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd77a7532bbffd614d8d773e8e" ON "guard_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_guard_status_entity" (
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                CONSTRAINT "FK_057428e102c7551617454ff2a14" FOREIGN KEY ("txId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION,
                PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_guard_status_entity"(
                    "eventId",
                    "guardPk",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "eventId",
                "guardPk",
                "updatedAt",
                "status",
                "txStatus",
                "txId"
            FROM "guard_status_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_guard_status_entity"
                RENAME TO "guard_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_Aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                CONSTRAINT "FK_7117e1356ea7cb4c0cbe74a71d8" FOREIGN KEY ("txId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_Aggregated_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txId"
            FROM "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_Aggregated_status_changed_entity"
                RENAME TO "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_aggregated_status_entity" (
                "eventId" varchar PRIMARY KEY NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                CONSTRAINT "FK_34be10333c7f7f26e4b7fcb8990" FOREIGN KEY ("txId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_aggregated_status_entity"(
                    "eventId",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "eventId",
                "updatedAt",
                "status",
                "txStatus",
                "txId"
            FROM "aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_aggregated_status_entity"
                RENAME TO "aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_49046f1dba53192a374f5fad91"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_dd77a7532bbffd614d8d773e8e"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_guard_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                CONSTRAINT "FK_f2893b45ffafa9e3945988ba1e5" FOREIGN KEY ("txId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_guard_status_changed_entity"(
                    "id",
                    "eventId",
                    "guardPk",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txId"
            FROM "guard_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_changed_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_guard_status_changed_entity"
                RENAME TO "guard_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde" ON "guard_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_49046f1dba53192a374f5fad91" ON "guard_status_changed_entity" ("guardPk")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd77a7532bbffd614d8d773e8e" ON "guard_status_changed_entity" ("insertedAt")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "IDX_dd77a7532bbffd614d8d773e8e"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_49046f1dba53192a374f5fad91"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity"
                RENAME TO "temporary_guard_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "guard_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "guard_status_changed_entity"(
                    "id",
                    "eventId",
                    "guardPk",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txId"
            FROM "temporary_guard_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_guard_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd77a7532bbffd614d8d773e8e" ON "guard_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_49046f1dba53192a374f5fad91" ON "guard_status_changed_entity" ("guardPk")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde" ON "guard_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
                RENAME TO "temporary_aggregated_status_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_entity" (
                "eventId" varchar PRIMARY KEY NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "aggregated_status_entity"(
                    "eventId",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "eventId",
                "updatedAt",
                "status",
                "txStatus",
                "txId"
            FROM "temporary_aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity"
                RENAME TO "temporary_Aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "aggregated_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txId"
            FROM "temporary_Aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_Aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity"
                RENAME TO "temporary_guard_status_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "guard_status_entity" (
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "guard_status_entity"(
                    "eventId",
                    "guardPk",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId"
                )
            SELECT "eventId",
                "guardPk",
                "updatedAt",
                "status",
                "txStatus",
                "txId"
            FROM "temporary_guard_status_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_guard_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_dd77a7532bbffd614d8d773e8e"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_49046f1dba53192a374f5fad91"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "tx_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_entity"
        `);
  }
}
