import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1715254604937 implements MigrationInterface {
  name = 'Migrations1715254604937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "asset_entity"');

    await queryRunner.query(`
            CREATE TABLE "token_entity" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "decimal" integer NOT NULL,
                "isNative" boolean NOT NULL,
                "chain" character varying NOT NULL,
                CONSTRAINT "PK_687443f2a51af49b5472e2c5ddc" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_asset_entity" (
                "amount" bigint NOT NULL,
                "chain" character varying NOT NULL,
                "tokenId" character varying NOT NULL,
                CONSTRAINT "PK_8470adda5563029fd48b7cbae09" PRIMARY KEY ("chain", "tokenId")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "bridged_asset_entity"
            ADD CONSTRAINT "FK_941e620c721dbd2ec1a03bdef36" FOREIGN KEY ("tokenId") REFERENCES "token_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "bridged_asset_entity"');
    await queryRunner.query('DROP TABLE "token_entity"');

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
}
