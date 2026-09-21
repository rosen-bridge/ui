import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

export class Migration1789808888162 implements MigrationInterface {
  name = 'Migration1789808888162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "event_status_override_entity"
    `);
    await queryRunner.query(`
      CREATE TABLE "event_status_override_entity" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "triggerTxId" varchar,
        "eventId" varchar NOT NULL,
        "status" varchar NOT NULL,
        "reason" varchar,
        "severity" varchar,
        CONSTRAINT "UQ_ed4f6f75bfa05caf9a230f79571" UNIQUE ("eventId", "triggerTxId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "event_status_override_entity"
    `);
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
}
