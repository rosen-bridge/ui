import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1767795454053 implements MigrationInterface {
  name = 'Migration1767795454053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_count_entity" DROP CONSTRAINT "UQ_e22fe0587a24002c52e84a6c4d1"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
            ADD "lastProcessedHeight" integer NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
            ADD CONSTRAINT "UQ_035b3c112fd24e7f006ea8fe622" UNIQUE ("status", "fromChain", "toChain")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_count_entity" DROP CONSTRAINT "UQ_035b3c112fd24e7f006ea8fe622"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity" DROP COLUMN "lastProcessedHeight"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_count_entity"
            ADD CONSTRAINT "UQ_e22fe0587a24002c52e84a6c4d1" UNIQUE ("fromChain", "toChain")
        `);
  }
}
