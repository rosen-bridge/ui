import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1759776111031 implements MigrationInterface {
  name = 'Migration1759776111031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "token_entity" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" character varying NOT NULL,
                CONSTRAINT "PK_687443f2a51af49b5472e2c5ddc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" character varying NOT NULL,
                "tokenId" character varying NOT NULL,
                "bridgedTokenId" character varying NOT NULL,
                CONSTRAINT "PK_bcf5000d95a1a89d72b583ca3c5" PRIMARY KEY ("chain", "tokenId")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "locked_asset_entity" (
                "amount" bigint NOT NULL,
                "address" character varying NOT NULL,
                "tokenId" character varying NOT NULL,
                CONSTRAINT "PK_362cd7e529f24ebafcb64827189" PRIMARY KEY ("address", "tokenId")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
            ADD CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "locked_asset_entity"
            ADD CONSTRAINT "FK_33f26e8995effacef21b3a5f4e9" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "locked_asset_entity" DROP CONSTRAINT "FK_33f26e8995effacef21b3a5f4e9"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity" DROP CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f"
        `);
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
