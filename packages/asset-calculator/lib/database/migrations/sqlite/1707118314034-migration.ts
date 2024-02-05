import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707118314034 implements MigrationInterface {
  name = 'Migration1707118314034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "asset_entity" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "decimal" integer NOT NULL,
                "amount" bigint NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "asset_entity"
        `);
  }
}
