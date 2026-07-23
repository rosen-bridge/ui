import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1757426872943 implements MigrationInterface {
  name = 'Migration1757426872943';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_token_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" varchar NOT NULL,
                "significantDecimal" integer NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_token_entity"("id", "name", "decimal", "isNative", "chain", "significantDecimal")
            SELECT "id",
                "name",
                "decimal",
                "isNative",
                "chain",
                0 as "significantDecimal"
            FROM "token_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "token_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_token_entity"
                RENAME TO "token_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token_entity"
                RENAME TO "temporary_token_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "token_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" varchar NOT NULL
            )
        `);
    await queryRunner.query(`
            INSERT INTO "token_entity"("id", "name", "decimal", "isNative", "chain")
            SELECT "id",
                "name",
                "decimal",
                "isNative",
                "chain"
            FROM "temporary_token_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_token_entity"
        `);
  }
}
