import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1775986364817 implements MigrationInterface {
  name = 'Migration1775986364817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_bridged_amount_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "lastProcessedHeight" integer NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL,
                CONSTRAINT "UQ_58ac9b1052d94a3a68b1630cd1b" UNIQUE ("fromChain", "day", "month", "year")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_bridged_amount_entity"(
                    "id",
                    "fromChain",
                    "lastProcessedHeight",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                0,
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "bridged_amount_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridged_amount_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_bridged_amount_entity"
                RENAME TO "bridged_amount_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity"
                RENAME TO "temporary_bridged_amount_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_amount_entity" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "fromChain" varchar NOT NULL,
                "toChain" vatchar NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" float NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "bridged_amount_entity"(
                    "id",
                    "fromChain",
                    "toChain",
                    "day",
                    "month",
                    "year",
                    "week",
                    "amount"
                )
            SELECT "id",
                "fromChain",
                "",
                "day",
                "month",
                "year",
                "week",
                "amount"
            FROM "temporary_bridged_amount_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_bridged_amount_entity"
        `);
  }
}
