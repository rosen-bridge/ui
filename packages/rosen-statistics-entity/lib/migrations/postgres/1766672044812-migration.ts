import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1766672044812 implements MigrationInterface {
  name = 'Migration1766672044812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_event_entity" (
                "id" SERIAL NOT NULL,
                "fromAddress" character varying NOT NULL,
                "toAddress" character varying NOT NULL,
                "count" integer NOT NULL,
                CONSTRAINT "UQ_9692a149b96f10f05c5efcc9f54" UNIQUE ("fromAddress", "toAddress"),
                CONSTRAINT "PK_d20ff8cfd407924d911a24a9b7c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "watcher_count_entity" (
                "id" SERIAL NOT NULL,
                "network" character varying NOT NULL,
                "count" integer NOT NULL,
                CONSTRAINT "PK_a4b327c53cadebf166ea7f26688" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_count_entity" (
                "id" SERIAL NOT NULL,
                "eventCount" integer NOT NULL,
                "status" character varying NOT NULL,
                "fromChain" character varying NOT NULL,
                "toChain" character varying NOT NULL,
                CONSTRAINT "UQ_e22fe0587a24002c52e84a6c4d1" UNIQUE ("fromChain", "toChain"),
                CONSTRAINT "PK_80591af1f52145a3de2f4a80882" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridge_fee_entity" (
                "id" SERIAL NOT NULL,
                "fromChain" character varying NOT NULL,
                "toChain" character varying NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" double precision NOT NULL,
                CONSTRAINT "PK_481656f43fdaacf98db143ed609" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "bridged_amount_entity" (
                "id" SERIAL NOT NULL,
                "fromChain" character varying NOT NULL,
                "toChain" character varying NOT NULL,
                "day" integer NOT NULL,
                "month" integer NOT NULL,
                "year" integer NOT NULL,
                "week" integer NOT NULL,
                "amount" double precision NOT NULL,
                CONSTRAINT "PK_bf2ae7dcaf1ccb61143d747eb1f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "metric_entity" (
                "id" SERIAL NOT NULL,
                "key" character varying NOT NULL,
                "value" character varying NOT NULL,
                "updatedAt" integer NOT NULL,
                CONSTRAINT "UQ_5714b2eb88e907150309375c132" UNIQUE ("key"),
                CONSTRAINT "PK_b8f0a89a824da3c4df1c4d43578" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "metric_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridged_amount_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "bridge_fee_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "event_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "watcher_count_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "user_event_entity"
        `);
  }
}
