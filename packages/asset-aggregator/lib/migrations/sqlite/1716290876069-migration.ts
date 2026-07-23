import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1716290876069 implements MigrationInterface {
  name = 'Migration1716290876069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "temporary_bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
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
    await queryRunner.query(`
            CREATE TABLE "locked_asset_entity" (
                "amount" bigint NOT NULL,
                "address" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                PRIMARY KEY ("address", "tokenId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "temporary_bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
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
    await queryRunner.query(`
            CREATE TABLE "temporary_locked_asset_entity" (
                "amount" bigint NOT NULL,
                "address" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                CONSTRAINT "FK_33f26e8995effacef21b3a5f4e9" FOREIGN KEY ("tokenId") REFERENCES "token_entity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                PRIMARY KEY ("address", "tokenId")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "temporary_locked_asset_entity"("amount", "address", "tokenId")
            SELECT "amount",
                "address",
                "tokenId"
            FROM "locked_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "locked_asset_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "temporary_locked_asset_entity"
                RENAME TO "locked_asset_entity"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "locked_asset_entity"
                RENAME TO "temporary_locked_asset_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "locked_asset_entity" (
                "amount" bigint NOT NULL,
                "address" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
                PRIMARY KEY ("address", "tokenId")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "locked_asset_entity"("amount", "address", "tokenId")
            SELECT "amount",
                "address",
                "tokenId"
            FROM "temporary_locked_asset_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "temporary_locked_asset_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
                RENAME TO "temporary_bridged_asset_entity"
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" varchar NOT NULL,
                "tokenId" varchar NOT NULL,
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
    await queryRunner.query(`
            DROP TABLE "locked_asset_entity"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
                RENAME TO "temporary_bridged_asset_entity"
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
