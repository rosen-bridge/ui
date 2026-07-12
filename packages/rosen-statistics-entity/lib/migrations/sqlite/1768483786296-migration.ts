import type {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1768483786296 implements MigrationInterface {
  name = 'Migration1768483786296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "temporary_user_event_entity" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fromAddress" varchar NOT NULL,
        "toAddress" varchar NOT NULL,
        "count" integer NOT NULL,
        "fromChain" varchar NOT NULL,
        "toChain" varchar NOT NULL,
        "lastProcessedHeight" integer NOT NULL,
        CONSTRAINT "UQ_4e8353cdfede6c7f4af5e44395e" UNIQUE (
          "fromAddress",
          "toAddress",
          "fromChain",
          "toChain"
        )
      )
    `);

    await queryRunner.query(`
      INSERT INTO "temporary_user_event_entity"(
        "id", "fromAddress", "toAddress", "count", "fromChain", "toChain", "lastProcessedHeight"
      )
      SELECT "id", "fromAddress", "toAddress", "count", '', '', 0
      FROM "user_event_entity"
    `);

    await queryRunner.query(`DROP TABLE "user_event_entity"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_event_entity" RENAME TO "user_event_entity"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "temporary_user_event_entity" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fromAddress" varchar NOT NULL,
        "toAddress" varchar NOT NULL,
        "count" integer NOT NULL,
        CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "temporary_user_event_entity"("id", "fromAddress", "toAddress", "count")
      SELECT "id", "fromAddress", "toAddress", "count"
      FROM "user_event_entity"
    `);

    await queryRunner.query(`DROP TABLE "user_event_entity"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_user_event_entity" RENAME TO "user_event_entity"`,
    );
  }
}
