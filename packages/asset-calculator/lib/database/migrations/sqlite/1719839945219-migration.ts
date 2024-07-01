import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719839945219 implements MigrationInterface {
  name = 'Migration1719839945219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                "bridgedTokenId" varchar NOT NULL DEFAULT ('-'),
                CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f" FOREIGN KEY ("tokenId") REFERENCES "token_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                PRIMARY KEY ("chain", "tokenId")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_bridged_asset_entity"("amount", "chain", "tokenId")
            SELECT "amount",
                "chain",
                "tokenId"
            FROM "bridged_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridged_asset_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_bridged_asset_entity"
                RENAME TO "bridged_asset_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
                RENAME TO "temporary_bridged_asset_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f" FOREIGN KEY ("tokenId") REFERENCES "token_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                PRIMARY KEY ("chain", "tokenId")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "bridged_asset_entity"("amount", "chain", "tokenId")
            SELECT "amount",
                "chain",
                "tokenId"
            FROM "temporary_bridged_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_bridged_asset_entity"
        `);
  }
}
