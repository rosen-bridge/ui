import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741702796894 implements MigrationInterface {
  name = 'Migration1741702796894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_entity" (
                "eventId" varchar PRIMARY KEY NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar
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
                "txId" varchar,
                "txChain" varchar
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
            CREATE TABLE "guard_status_entity" (
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                "txChain" varchar,
                PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tx_entity" (
                "txId" varchar NOT NULL,
                "chain" varchar NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "txType" varchar NOT NULL,
                PRIMARY KEY ("txId", "chain")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ea5b8b459baaccb7c72523cb52" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78e94709962fad5c96583bbe09" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_aggregated_status_entity" (
                "eventId" varchar PRIMARY KEY NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar,
                CONSTRAINT "FK_b52da2f98009c4747f449a402b3" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity" ("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_aggregated_status_entity"(
                    "eventId",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId",
                    "txChain"
                )
            SELECT "eventId",
                "updatedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
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
                "txChain" varchar,
                CONSTRAINT "FK_f31d4cf94b334ec87ec936f76f6" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity" ("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
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
                    "txId",
                    "txChain"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
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
    await queryRunner.query(`
            CREATE TABLE "temporary_guard_status_entity" (
                "eventId" varchar NOT NULL,
                "guardPk" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar,
                "txId" varchar,
                "txChain" varchar,
                CONSTRAINT "FK_4d2d2228185a1be4e5f26b54667" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity" ("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION,
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
                    "txId",
                    "txChain"
                )
            SELECT "eventId",
                "guardPk",
                "updatedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
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
            DROP INDEX "IDX_ea5b8b459baaccb7c72523cb52"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_78e94709962fad5c96583bbe09"
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar,
                CONSTRAINT "FK_2dc2218d76c16a68ef9de380fb1" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity" ("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_aggregated_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId",
                    "txChain"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
            FROM "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_aggregated_status_changed_entity"
                RENAME TO "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ea5b8b459baaccb7c72523cb52" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78e94709962fad5c96583bbe09" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "IDX_78e94709962fad5c96583bbe09"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_ea5b8b459baaccb7c72523cb52"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity"
                RENAME TO "temporary_aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventId" varchar NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" varchar NOT NULL,
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "aggregated_status_changed_entity"(
                    "id",
                    "eventId",
                    "insertedAt",
                    "status",
                    "txStatus",
                    "txId",
                    "txChain"
                )
            SELECT "id",
                "eventId",
                "insertedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
            FROM "temporary_aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78e94709962fad5c96583bbe09" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ea5b8b459baaccb7c72523cb52" ON "aggregated_status_changed_entity" ("eventId")
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
                "txChain" varchar,
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
                    "txId",
                    "txChain"
                )
            SELECT "eventId",
                "guardPk",
                "updatedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
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
                "txId" varchar,
                "txChain" varchar
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
                    "txId",
                    "txChain"
                )
            SELECT "id",
                "eventId",
                "guardPk",
                "insertedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
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
                "txStatus" varchar NOT NULL,
                "txId" varchar,
                "txChain" varchar
            )
        `);
    await queryRunner.query(`
            INSERT INTO "aggregated_status_entity"(
                    "eventId",
                    "updatedAt",
                    "status",
                    "txStatus",
                    "txId",
                    "txChain"
                )
            SELECT "eventId",
                "updatedAt",
                "status",
                "txStatus",
                "txId",
                "txChain"
            FROM "temporary_aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_aggregated_status_entity"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_78e94709962fad5c96583bbe09"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_ea5b8b459baaccb7c72523cb52"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "tx_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_entity"
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
            DROP TABLE "aggregated_status_entity"
        `);
  }
}
