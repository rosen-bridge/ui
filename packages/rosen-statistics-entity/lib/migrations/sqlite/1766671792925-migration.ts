import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766671792925 implements MigrationInterface {
  name = 'Migration1766671792925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_event_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromAddress" varchar NOT NULL,
                "toAddress" varchar NOT NULL,
                "count" integer NOT NULL,
                CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "watcher_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "network" varchar NOT NULL,
                "count" integer NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_count_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "eventCount" integer NOT NULL,
                "status" varchar NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                CONSTRAINT "UQ_e22fe0587a24002c52e84a6c4d1" UNIQUE ("fromChain", "toChain")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridge_fee_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_amount_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" varchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "metric_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "key" varchar NOT NULL,
                "value" varchar NOT NULL,
                "updatedAt" integer NOT NULL,
                CONSTRAINT "UQ_5714b2eb88e907150309375c132" UNIQUE ("key")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "metric_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridged_amount_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "watcher_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "user_event_entity"
        `);
  }
}
