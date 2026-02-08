import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1762606291770 implements MigrationInterface {
  name = 'Migration1762606291770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ALTER COLUMN "significantDecimal" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
            ADD CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity" DROP CONSTRAINT "FK_509519eb0f5f6be69bccdfd0f7f"
        `);
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ALTER COLUMN "significantDecimal"
            SET DEFAULT '0'
        `);
  }
}
