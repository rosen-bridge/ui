import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migrations1715255924893 implements MigrationInterface {
  name = 'Migrations1715255924893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "asset_entity"');

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
                CONSTRAINT "FK_941e620c721dbd2ec1a03bdef36" FOREIGN KEY ("tokenId") REFERENCES "token_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                PRIMARY KEY ("chain", "tokenId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "bridged_asset_entity"');
    await queryRunner.query('DROP TABLE "token_entity"');

    await queryRunner.query(`
            CREATE TABLE "asset_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "amount" bigint NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" varchar NOT NULL
            )
        `);
  }
}
