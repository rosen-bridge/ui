import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class Migration1786789762089 implements MigrationInterface {
  name = 'Migration1786789762089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event_status_override_entity" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "eventTriggerId" integer NOT NULL,
        "eventId" varchar NOT NULL,
        "status" varchar NOT NULL,
        "reason" varchar,
        "severity" varchar,
        CONSTRAINT "UQ_a5172f307e9a415285c2e9a5b72" UNIQUE ("eventId", "eventTriggerId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "event_status_override_entity"
    `);
  }
}
