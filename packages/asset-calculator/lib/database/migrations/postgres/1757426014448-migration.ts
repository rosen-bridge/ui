import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757426014448 implements MigrationInterface {
  name = 'Migration1757426014448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ADD "significantDecimal" integer NOT NULL
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
            ALTER TABLE "token_entity" DROP COLUMN "significantDecimal"
        `);
  }
}
