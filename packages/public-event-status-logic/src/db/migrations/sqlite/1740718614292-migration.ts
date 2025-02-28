import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1740718614292 implements MigrationInterface {
  name = 'Migration1740718614292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "overall_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txTxId" varchar
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "overall_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "overall_status_changed_entity" ("insertedAt")
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
                "txTxId" varchar
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
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_overall_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txTxId" varchar,
                CONSTRAINT "FK_f432ba0eadbde30450db8aea626" FOREIGN KEY ("txTxId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_overall_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txTxId"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txTxId"
            FROM "overall_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "overall_status_changed_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_overall_status_changed_entity"
                RENAME TO "overall_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "overall_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "overall_status_changed_entity" ("insertedAt")
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
                "txTxId" varchar,
                CONSTRAINT "FK_5dc5181b1b4a5a57dfeb54b6cfe" FOREIGN KEY ("txTxId") REFERENCES "tx_entity" ("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
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
                    "txTxId"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txTxId"
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
                "txTxId" varchar
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
                    "txTxId"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txTxId"
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
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "overall_status_changed_entity"
                RENAME TO "temporary_overall_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "overall_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txTxId" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "overall_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txTxId"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txTxId"
            FROM "temporary_overall_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_overall_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_64be6b94b1e7981c34f2e456de" ON "overall_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d696c7b16fe4c6134778ccd2e2" ON "overall_status_changed_entity" ("eventId")
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
            DROP INDEX "IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP TABLE "overall_status_changed_entity"
        `);
  }
}
