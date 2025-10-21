import {
  MigrationInterface,
  QueryRunner,
} from '@rosen-bridge/extended-typeorm';

export class Migration1760945300147 implements MigrationInterface {
  name = 'Migration1760945300147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE VIEW asset_view AS
      SELECT
        te.id,
        te.name,
        te.decimal,
        te."isNative",
        te.chain,
        baeq."bridged",
        laeq."lockedPerAddress"
      FROM token_entity te
      LEFT JOIN (
        SELECT
          bae."tokenId",
          SUM(bae.amount) AS "bridged"
        FROM bridged_asset_entity bae
        GROUP BY bae."tokenId"
      ) AS baeq
        ON baeq."tokenId" = te.id
      LEFT JOIN (
        SELECT
          lae."tokenId",
          JSONB_AGG(to_jsonb(lae) - 'tokenId') AS "lockedPerAddress"
        FROM locked_asset_entity lae
        GROUP BY lae."tokenId"
      ) AS laeq
        ON laeq."tokenId" = te.id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS asset_view;`);
  }
}
