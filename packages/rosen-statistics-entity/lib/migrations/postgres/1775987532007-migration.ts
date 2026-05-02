import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1775987532007 implements MigrationInterface {
  name = 'Migration1775987532007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity" DROP COLUMN "toChain"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity"
            ADD "lastProcessedHeight" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity"
            ADD CONSTRAINT "UQ_58ac9b1052d94a3a68b1630cd1b" UNIQUE ("fromChain", "day", "month", "year")
        `);
    await queryRunner.query(`
            UPDATE "bridge_amount_entity"
            SET "lastProcessedHeight" = 0
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity"
            ALTER COLUMN "lastProcessedHeight" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity" DROP CONSTRAINT "UQ_58ac9b1052d94a3a68b1630cd1b"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity" DROP COLUMN "lastProcessedHeight"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity"
            ADD "toChain" character varying
        `);
    await queryRunner.query(`
            UPDATE "bridge_amount_entity"
            SET "toChain" = ''
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_amount_entity"
            ALTER COLUMN "toChain" SET NOT NULL
        `);
  }
}
