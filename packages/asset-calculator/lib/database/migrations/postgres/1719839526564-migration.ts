import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719839526564 implements MigrationInterface {
  name = 'Migration1719839526564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "bridged_asset_entity"');
    await queryRunner.query(`
      CREATE TABLE "bridged_asset_entity" (
          "amount" bigint NOT NULL,
          "chain" character varying NOT NULL,
          "tokenId" character varying NOT NULL,
          "bridgedTokenId" character varying NOT NULL,
          CONSTRAINT "PK_8470adda5563029fd48b7cbae09" PRIMARY KEY ("chain", "tokenId")
      )
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "bridged_asset_entity"');
    await queryRunner.query(`
      CREATE TABLE "bridged_asset_entity" (
          "amount" bigint NOT NULL,
          "chain" character varying NOT NULL,
          "tokenId" character varying NOT NULL,
          CONSTRAINT "PK_8470adda5563029fd48b7cbae09" PRIMARY KEY ("chain", "tokenId")
      )
  `);
  }
}
