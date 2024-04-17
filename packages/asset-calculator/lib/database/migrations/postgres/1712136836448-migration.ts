import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1712136836448 implements MigrationInterface {
  name = 'Migration1712136836448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "asset_entity" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "decimal" integer NOT NULL,
                "amount" bigint NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" character varying NOT NULL,
                CONSTRAINT "PK_038b7b28b83db2205747ef9912e" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "asset_entity"
        `);
  }
}
