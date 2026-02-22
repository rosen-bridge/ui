import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1768483838915 implements MigrationInterface {
  name = 'Migration1768483838915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      DROP CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ADD "fromChain" character varying
    `);
    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ADD "toChain" character varying
    `);
    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ADD "lastProcessedHeight" integer
    `);

    await queryRunner.query(`
      UPDATE "user_event_entity"
      SET "fromChain" = '', "toChain" = '', "lastProcessedHeight" = 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ALTER COLUMN "fromChain" SET NOT NULL,
      ALTER COLUMN "toChain" SET NOT NULL,
      ALTER COLUMN "lastProcessedHeight" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ADD CONSTRAINT "UQ_4e8353cdfede6c7f4af5e44395e" UNIQUE (
        "fromAddress",
        "toAddress",
        "fromChain",
        "toChain"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_event_entity" DROP CONSTRAINT "UQ_4e8353cdfede6c7f4af5e44395e"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      DROP COLUMN "lastProcessedHeight",
      DROP COLUMN "toChain",
      DROP COLUMN "fromChain"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_event_entity"
      ADD CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress")
    `);
  }
}
