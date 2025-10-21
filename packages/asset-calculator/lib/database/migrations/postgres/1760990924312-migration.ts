import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1760990924312 implements MigrationInterface {
  name = 'Migration1760990924312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW event_view AS
      SELECT
        oe."id" AS "id",
        oe."fromChain" AS "fromChain",
        oe."toChain" AS "toChain",
        oe."fromAddress" AS "fromAddress",
        oe."toAddress" AS "toAddress",
        oe."height" AS "height",
        oe."amount" AS "amount",
        oe."networkFee" AS "networkFee",
        oe."bridgeFee" AS "bridgeFee",
        oe."sourceChainTokenId" AS "sourceChainTokenId",
        oe."sourceTxId" AS "sourceTxId",
        oe."requestId" AS "eventId",
        be."timestamp" AS "timestamp",
        COALESCE(ete."WIDsCount", 0) AS "WIDsCount",
        ete."paymentTxId" AS "paymentTxId",
        ete."spendTxId" AS "spendTxId",
        COALESCE(
          FIRST_VALUE(ete."result") OVER (
            PARTITION BY ete."eventId"
            ORDER BY COALESCE(ete."result", 'processing') DESC
          ),
          'processing'
        ) AS status,
        (CAST(oe."amount" AS DOUBLE PRECISION) / POWER(10, COALESCE(te."significantDecimal", 0))) AS "amountNormalized",
        (CAST(oe."networkFee" AS DOUBLE PRECISION) / POWER(10, COALESCE(te."significantDecimal", 0))) AS "networkFeeNormalized",
        (CAST(oe."bridgeFee" AS DOUBLE PRECISION) / POWER(10, COALESCE(te."significantDecimal", 0))) AS "bridgeFeeNormalized"
      FROM observation_entity oe
      LEFT JOIN block_entity be ON be."hash" = oe."block"
      LEFT JOIN event_trigger_entity ete ON ete."eventId" = oe."requestId"
      LEFT JOIN token_entity te ON te."id" = oe."sourceChainTokenId";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS event_view;`);
  }
}
