import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1716290617188 implements MigrationInterface {
  name = 'Migration1716290617188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity" DROP CONSTRAINT "FK_941e620c721dbd2ec1a03bdef36"
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
            ALTER TABLE "bridged_asset_entity"
            ADD CONSTRAINT "FK_941e620c721dbd2ec1a03bdef36" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
