import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1740674459019 implements MigrationInterface {
  name = 'Migration1740674459019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "overall_status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txTxId" character varying,
                CONSTRAINT "PK_f707185541bd9aa5420a00b6673" PRIMARY KEY ("id")
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
                "txTxId" character varying,
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
            ALTER TABLE "overall_status_changed_entity"
            ADD CONSTRAINT "FK_f432ba0eadbde30450db8aea626" FOREIGN KEY ("txTxId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity"
            ADD CONSTRAINT "FK_5dc5181b1b4a5a57dfeb54b6cfe" FOREIGN KEY ("txTxId") REFERENCES "tx_entity"("txId") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity" DROP CONSTRAINT "FK_5dc5181b1b4a5a57dfeb54b6cfe"
        `);
    await queryRunner.query(`
            ALTER TABLE "overall_status_changed_entity" DROP CONSTRAINT "FK_f432ba0eadbde30450db8aea626"
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
            DROP INDEX "public"."IDX_64be6b94b1e7981c34f2e456de"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d696c7b16fe4c6134778ccd2e2"
        `);
    await queryRunner.query(`
            DROP TABLE "overall_status_changed_entity"
        `);
  }
}
