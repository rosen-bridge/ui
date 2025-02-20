import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1739867581065 implements MigrationInterface {
  name = 'Migration1739867581065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "guard_status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "guardPk" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txId" character varying,
                "txType" character varying,
                "txStatus" character varying,
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
            CREATE TABLE "status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txId" character varying,
                "txType" character varying,
                "txStatus" character varying,
                CONSTRAINT "PK_1c6eb487e38ff8fc89b472b7c70" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_993a2ced159a7a89f558d5fae2" ON "status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_e1ebb399bb68c64e84b95abb2b" ON "status_changed_entity" ("insertedAt")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e1ebb399bb68c64e84b95abb2b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_993a2ced159a7a89f558d5fae2"
        `);
    await queryRunner.query(`
            DROP TABLE "status_changed_entity"
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
  }
}
