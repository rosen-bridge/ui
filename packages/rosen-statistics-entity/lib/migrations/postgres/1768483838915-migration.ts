import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1768483838915 implements MigrationInterface {
  name = 'Migration1768483838915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_event_entity"
            ADD "lastProcessedHeight" integer NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_event_entity" DROP COLUMN "lastProcessedHeight"
        `);
  }
}
