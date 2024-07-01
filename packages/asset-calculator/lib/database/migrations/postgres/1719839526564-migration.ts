import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719839526564 implements MigrationInterface {
  name = 'Migration1719839526564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
            ADD "bridgedTokenId" character varying NOT NULL DEFAULT '-'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity" DROP COLUMN "bridgedTokenId"
        `);
  }
}
