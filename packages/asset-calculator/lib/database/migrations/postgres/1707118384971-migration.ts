import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707118384971 implements MigrationInterface {
  name = 'Migration1707118384971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "test_entity" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "decimal" integer NOT NULL,
                "amount" bigint NOT NULL,
                "isNative" boolean NOT NULL,
                CONSTRAINT "PK_cc0413536e3afc0e586996bea40" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "asset_entity"
        `);
  }
}
