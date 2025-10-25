import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1761203759400 implements MigrationInterface {
  name = 'Migration1761203759400';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TABLE "bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                "bridgedTokenId" varchar NOT NULL,
                PRIMARY KEY ("chain", "tokenId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "locked_asset_entity" (
                "amount" bigint NOT NULL,
                "address" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                PRIMARY KEY ("address", "tokenId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "locked_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridged_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "token_entity"
        `);
  }
}
