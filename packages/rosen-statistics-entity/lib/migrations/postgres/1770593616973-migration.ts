import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770593616973 implements MigrationInterface {
  name = 'Migration1770593616973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity" DROP COLUMN "toChain"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
            ADD "lastProcessedHeight" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
            ADD CONSTRAINT "UQ_1395986621376af58c09efc82a8" UNIQUE ("fromChain", "day", "month", "year")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity" DROP CONSTRAINT "UQ_1395986621376af58c09efc82a8"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity" DROP COLUMN "lastProcessedHeight"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridge_fee_entity"
            ADD "toChain" character varying NOT NULL
        `);
  }
}
