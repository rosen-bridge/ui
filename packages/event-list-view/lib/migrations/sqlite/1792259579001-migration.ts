import type { MigrationInterface, QueryRunner } from '@rosen-bridge/extended-typeorm';

/**
 * sqlite has no materialized views, so a plain view is used
 */
export class Migration1792259579001 implements MigrationInterface {
  name = 'Migration1792259579001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIEW "event_list_view" AS
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
        CAST(oe."amount" || 'e-' || COALESCE(te."significantDecimal", 0) AS NUMERIC) AS "amountWithDecimal",
        CAST(oe."networkFee" || 'e-' || COALESCE(te."significantDecimal", 0) AS NUMERIC) AS "networkFeeWithDecimal",
        CAST(oe."bridgeFee" || 'e-' || COALESCE(te."significantDecimal", 0) AS NUMERIC) AS "bridgeFeeWithDecimal",
        oe."sourceChainTokenId" AS "lockTokenId",
        oe."sourceTxId" AS "sourceTxId",
        oe."requestId" AS "eventId",
        be."timestamp" AS "timestamp",
        COALESCE(ete."WIDsCount", 0) AS "reports",
        ete."id" AS "triggerId",
        ete."paymentTxId" AS "paymentTxId",
        ete."spendTxId" AS "spendTxId",
        ete."txId" AS "triggerTxId",
        CAST(COUNT(ete."id") OVER (PARTITION BY oe."id") AS INTEGER) AS "flows",
        CASE
          WHEN ete."id" IS NULL THEN 'CREATED'
          WHEN ete."result" = 'fraud' THEN 'FRAUD'
          WHEN ete."result" = 'successful' THEN 'COMPLETED'
          WHEN COALESCE(ete."result", '') <> '' THEN 'CREATED'
          WHEN COALESCE(ase."status", '') = '' OR ase."status" = 'waiting-for-confirmation' THEN 'TRIGGERED'
          WHEN ase."status" = 'finished' THEN 'COMPLETED'
          WHEN ase."status" = 'pending-payment' THEN 'PAYMENT_PENDING'
          WHEN ase."status" = 'in-payment' THEN
            CASE ase."txStatus"
              WHEN 'in-sign' THEN 'PAYMENT_SIGNING'
              WHEN 'signed' THEN 'PAYMENT_SIGNED'
              WHEN 'sent' THEN 'PAYMENT_SENT'
              WHEN 'completed' THEN 'PAID'
              WHEN 'invalid' THEN 'PAYMENT_ABORTED'
              ELSE 'PAYMENT_APPROVED'
            END
          WHEN ase."status" = 'payment-waiting' THEN 'PAYMENT_STALLED'
          WHEN ase."status" = 'pending-reward' THEN 'REWARD_PENDING'
          WHEN ase."status" = 'in-reward' THEN
            CASE ase."txStatus"
              WHEN 'in-sign' THEN 'REWARD_SIGNING'
              WHEN 'signed' THEN 'REWARD_SIGNED'
              WHEN 'sent' THEN 'REWARD_SENT'
              WHEN 'completed' THEN 'REWARDED'
              WHEN 'invalid' THEN 'REWARD_ABORTED'
              ELSE 'REWARD_APPROVED'
            END
          WHEN ase."status" = 'reward-waiting' THEN 'REWARD_STALLED'
          WHEN ase."status" = 'rejected' THEN 'REJECTED'
          WHEN ase."status" = 'reached-limit' THEN 'REACHED_LIMIT'
          WHEN ase."status" = 'timeout' THEN 'TIMEOUT'
          ELSE 'CREATED'
        END AS "status"
      FROM "observation_entity" oe
      LEFT JOIN "block_entity" be ON be."hash" = oe."block"
      LEFT JOIN "event_trigger_entity" ete ON ete."eventId" = oe."requestId"
      LEFT JOIN "token_entity" te ON te."id" = oe."sourceChainTokenId"
      LEFT JOIN "aggregated_status_entity" ase ON ase."triggerTxId" = ete."txId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP VIEW "event_list_view"
    `);
  }
}
