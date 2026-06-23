import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1781608382828 implements MigrationInterface {
  name = 'Migration1781608382828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
            ADD "triggerTxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "PK_9517f829114915e69d8abaa4f57"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
            ADD CONSTRAINT "PK_645419fb04acbba16de0dee1684" PRIMARY KEY ("eventId", "triggerTxId")
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity"
            ADD "triggerTxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity"
            ADD "triggerTxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity" DROP CONSTRAINT "PK_c77d85b5fbfa89177d45c5317e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity"
            ADD CONSTRAINT "PK_e62b981cbe5406f9ce3b318a2ad" PRIMARY KEY ("eventId", "guardPk", "triggerTxId")
        `);
    await queryRunner.query(`
            ALTER TABLE "tx_entity"
            ADD "triggerTxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity"
            ADD "triggerTxId" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4382413985dc677f801c6ed29b" ON "guard_status_changed_entity" ("triggerTxId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_d03acd864c3ccc4274562bbebd" ON "aggregated_status_changed_entity" ("triggerTxId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_d03acd864c3ccc4274562bbebd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4382413985dc677f801c6ed29b"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_changed_entity" DROP COLUMN "triggerTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "tx_entity" DROP COLUMN "triggerTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity" DROP CONSTRAINT "PK_e62b981cbe5406f9ce3b318a2ad"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity"
            ADD CONSTRAINT "PK_c77d85b5fbfa89177d45c5317e2" PRIMARY KEY ("eventId", "guardPk")
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_entity" DROP COLUMN "triggerTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "guard_status_changed_entity" DROP COLUMN "triggerTxId"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "PK_645419fb04acbba16de0dee1684"
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity"
            ADD CONSTRAINT "PK_9517f829114915e69d8abaa4f57" PRIMARY KEY ("eventId")
        `);
    await queryRunner.query(`
            ALTER TABLE "aggregated_status_entity" DROP COLUMN "triggerTxId"
        `);
  }
}
