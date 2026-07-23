import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1767778012669 implements MigrationInterface {
  name = 'Migration1767778012669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ADD "ergoSideTokenId" character varying NOT NULL DEFAULT ''
        `);
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ADD "isResident" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ALTER COLUMN "ergoSideTokenId" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "token_entity"
            ALTER COLUMN "isResident" DROP DEFAULT
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "token_entity" DROP COLUMN "isResident"
        `);
    await queryRunner.query(`
            ALTER TABLE "token_entity" DROP COLUMN "ergoSideTokenId"
        `);
  }
}
