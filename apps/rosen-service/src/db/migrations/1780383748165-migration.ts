import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1780383748165 implements MigrationInterface {
  name = 'Migration1780383748165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity"
            ADD "test" double precision NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity"
            ADD "lastProcessedHeight1" integer NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity" DROP COLUMN "lastProcessedHeight1"
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_amount_entity" DROP COLUMN "test"
        `);
  }
}
