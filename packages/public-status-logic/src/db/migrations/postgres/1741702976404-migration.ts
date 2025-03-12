import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741702976404 implements MigrationInterface {
  name = 'Migration1741702976404';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_entity" (
                "eventId" character varying NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying NOT NULL,
                "txId" character varying,
                "txChain" character varying,
                CONSTRAINT "PK_9517f829114915e69d8abaa4f57" PRIMARY KEY ("eventId")
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
                "txChain" character varying,
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
            CREATE TABLE "guard_status_entity" (
                "eventId" character varying NOT NULL,
                "guardPk" character varying NOT NULL,
                "updatedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying,
                "txId" character varying,
                "txChain" character varying,
                CONSTRAINT "PK_c77d85b5fbfa89177d45c5317e2" PRIMARY KEY ("eventId", "guardPk")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tx_entity" (
                "txId" character varying NOT NULL,
                "chain" character varying NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "txType" character varying NOT NULL,
                CONSTRAINT "PK_4760fcac79ec0442eeb1d9807ff" PRIMARY KEY ("txId", "chain")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "aggregated_status_changed_entity" (
                "id" SERIAL NOT NULL,
                "eventId" character varying NOT NULL,
                "insertedAt" integer NOT NULL,
                "status" character varying NOT NULL,
                "txStatus" character varying NOT NULL,
                "txId" character varying,
                "txChain" character varying,
                CONSTRAINT "PK_e259cd03aaeea13f57bff471ab6" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ea5b8b459baaccb7c72523cb52" ON "aggregated_status_changed_entity" ("eventId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_78e94709962fad5c96583bbe09" ON "aggregated_status_changed_entity" ("insertedAt")
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
            ADD CONSTRAINT "FK_b52da2f98009c4747f449a402b3" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity"("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity"
            ADD CONSTRAINT "FK_f31d4cf94b334ec87ec936f76f6" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity"("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity"
            ADD CONSTRAINT "FK_4d2d2228185a1be4e5f26b54667" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity"("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity"
            ADD CONSTRAINT "FK_2dc2218d76c16a68ef9de380fb1" FOREIGN KEY ("txId", "txChain") REFERENCES "tx_entity"("txId", "chain") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity" DROP CONSTRAINT "FK_2dc2218d76c16a68ef9de380fb1"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity" DROP CONSTRAINT "FK_4d2d2228185a1be4e5f26b54667"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity" DROP CONSTRAINT "FK_f31d4cf94b334ec87ec936f76f6"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "FK_b52da2f98009c4747f449a402b3"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_78e94709962fad5c96583bbe09"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ea5b8b459baaccb7c72523cb52"
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
            DROP TABLE "aggregated_status_entity"
        `);
  }
}
