import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1767776960633 implements MigrationInterface {
  name = 'Migration1767776960633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "token_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "token_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" varchar NOT NULL,
                "significantDecimal" integer NOT NULL,
                "ergoSideTokenId" varchar NOT NULL,
                "isResident" boolean NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "token_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "token_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" varchar NOT NULL,
                "significantDecimal" integer NOT NULL
            )
        `);
  }
}
