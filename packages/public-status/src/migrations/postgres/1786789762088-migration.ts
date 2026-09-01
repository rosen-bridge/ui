import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class Migration1786789762088 implements MigrationInterface {
  name = 'Migration1786789762088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_status_override_entity" (
        "id" SERIAL NOT NULL,
        "eventTriggerId" integer NOT NULL,
        "eventId" character varying NOT NULL,
        "status" character varying NOT NULL,
        "reason" character varying,
        "severity" character varying,
        CONSTRAINT "UQ_a5172f307e9a415285c2e9a5b72" UNIQUE ("eventId", "eventTriggerId"),
        CONSTRAINT "PK_3cdf09b10ba135ab4c1126fc3c8" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "event_status_override_entity"
    `);
  }
}
