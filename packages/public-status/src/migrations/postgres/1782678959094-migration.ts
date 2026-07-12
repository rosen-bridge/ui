import type {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1782678959094 implements MigrationInterface {
  name = 'Migration1782678959094';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // aggregated_status_entity
    await queryRunner.query(`
      DELETE FROM "aggregated_status_entity";
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity"
        ADD "triggerTxId" character varying NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "PK_9517f829114915e69d8abaa4f57"
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity"
        ADD CONSTRAINT "PK_55f82c5601e22ed77d0161310ba" PRIMARY KEY ("triggerTxId")
    `);

    // guard_status_changed_entity
    await queryRunner.query(`
      DELETE FROM "guard_status_changed_entity";
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_d2411e3bb5bbcd79d5cef6ddde"
    `);
    await queryRunner.query(`
      ALTER TABLE "guard_status_changed_entity"
        ADD "triggerTxId" character varying NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_4382413985dc677f801c6ed29b" ON "guard_status_changed_entity" ("triggerTxId")
    `);

    // guard_status_entity
    await queryRunner.query(`
      DELETE FROM "guard_status_entity";
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
        ADD CONSTRAINT "PK_377a83b8af89e3c39ed4ec9df3b" PRIMARY KEY ("triggerTxId", "guardPk")
    `);

    // aggregated_status_changed_entity
    await queryRunner.query(`
      DELETE FROM "aggregated_status_changed_entity";
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_ea5b8b459baaccb7c72523cb52"
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_changed_entity"
        ADD "triggerTxId" character varying NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_d03acd864c3ccc4274562bbebd" ON "aggregated_status_changed_entity" ("triggerTxId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // guard_status_entity
    await queryRunner.query(`
      ALTER TABLE "guard_status_entity" DROP CONSTRAINT "PK_377a83b8af89e3c39ed4ec9df3b"
    `);
    await queryRunner.query(`
      ALTER TABLE "guard_status_entity"
        ADD CONSTRAINT "PK_c77d85b5fbfa89177d45c5317e2" PRIMARY KEY ("eventId", "guardPk")
    `);
    await queryRunner.query(`
      ALTER TABLE "guard_status_entity" DROP COLUMN "triggerTxId"
    `);

    // aggregated_status_entity
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity" DROP CONSTRAINT "PK_55f82c5601e22ed77d0161310ba"
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity"
        ADD CONSTRAINT "PK_9517f829114915e69d8abaa4f57" PRIMARY KEY ("eventId")
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_entity" DROP COLUMN "triggerTxId"
    `);

    // aggregated_status_changed_entity
    await queryRunner.query(`
      DROP INDEX "public"."IDX_d03acd864c3ccc4274562bbebd"
    `);
    await queryRunner.query(`
      ALTER TABLE "aggregated_status_changed_entity" DROP COLUMN "triggerTxId"
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ea5b8b459baaccb7c72523cb52" ON "aggregated_status_changed_entity" ("eventId")
    `);

    // guard_status_changed_entity
    await queryRunner.query(`
      DROP INDEX "public"."IDX_4382413985dc677f801c6ed29b"
    `);
    await queryRunner.query(`
      ALTER TABLE "guard_status_changed_entity" DROP COLUMN "triggerTxId"
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_d2411e3bb5bbcd79d5cef6ddde" ON "guard_status_changed_entity" ("eventId")
    `);
  }
}
