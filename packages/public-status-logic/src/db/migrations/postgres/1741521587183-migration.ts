import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741521587183 implements MigrationInterface {
  name = 'Migration1741521587183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "guard_status_entity" (
                "eventId" character varying NOT NULL,
                "guardPk" character varying NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txId" character varying,
                CONSTRAINT "PK_c77d85b5fbfa89177d45c5317e2" PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txId" character varying,
                CONSTRAINT "PK_f707185541bd9aa5420a00b6673" PRIMARY KEY ("id")
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
                "eventId" character varying NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txId" character varying,
                CONSTRAINT "PK_d97a4599c8768d6db4ab762f266" PRIMARY KEY ("eventId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tx_entity" (
                "txId" character varying NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "txType" character varying NOT NULL,
                CONSTRAINT "PK_b5f6285dce22b4169d1a292d3a4" PRIMARY KEY ("txId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "guard_status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "guardPk" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txId" character varying,
                CONSTRAINT "PK_2184078646f9d030755d02454c2" PRIMARY KEY ("id")
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
            ALTER TABLE "guard_status_entity"
            ADD CONSTRAINT "FK_057428e102c7551617454ff2a14" FOREIGN KEY ("txId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity"
            ADD CONSTRAINT "FK_7117e1356ea7cb4c0cbe74a71d8" FOREIGN KEY ("txId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
            ADD CONSTRAINT "FK_34be10333c7f7f26e4b7fcb8990" FOREIGN KEY ("txId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity"
            ADD CONSTRAINT "FK_f2893b45ffafa9e3945988ba1e5" FOREIGN KEY ("txId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity" DROP CONSTRAINT "FK_f2893b45ffafa9e3945988ba1e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "FK_34be10333c7f7f26e4b7fcb8990"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity" DROP CONSTRAINT "FK_7117e1356ea7cb4c0cbe74a71d8"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity" DROP CONSTRAINT "FK_057428e102c7551617454ff2a14"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dd77a7532bbffd614d8d773e8e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_49046f1dba53192a374f5fad91"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d2411e3bb5bbcd79d5cef6ddde"
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
            DROP INDEX "public"."IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP TABLE "aggregated_status_changed_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "guard_status_entity"
        `);
  }
}
