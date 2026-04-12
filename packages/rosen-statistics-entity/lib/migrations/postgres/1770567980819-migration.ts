import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1770567980819 implements MigrationInterface {
  name = 'Migration1770567980819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "watcher_count_entity"
            ADD CONSTRAINT "UQ_09bbec37cc7412190d5c9275df5" UNIQUE ("network")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "watcher_count_entity" DROP CONSTRAINT "UQ_09bbec37cc7412190d5c9275df5"
        `);
  }
}
