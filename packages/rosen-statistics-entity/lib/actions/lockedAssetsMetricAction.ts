import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';

export class LockedAssetsMetricAction {
  private readonly logger: AbstractLogger;

  constructor(
    private readonly dataSource: DataSource,
    logger?: AbstractLogger,
  ) {
    this.logger = logger ?? new DummyLogger();
    this.logger.debug('LockedAssetsMetricAction initialized');
  }

  /**
   * Fetches all locked assets from the database.
   *
   * @returns A promise that resolves to an array of locked asset entities
   */
  getLockedAssets = async (): Promise<LockedAssetEntity[]> => {
    this.logger.debug('Fetching all locked assets from database...');
    const assets = await this.dataSource
      .getRepository(LockedAssetEntity)
      .find();
    this.logger.debug(`Fetched ${assets.length} locked assets`);
    return assets;
  };

  /**
   * Retrieves the significant decimals for a given token ID.
   *
   * @param tokenId - The unique identifier of the token
   * @returns A promise that resolves to:
   *          - The number of significant decimals if the token exists
   *          - `undefined` if the token is not found
   */
  getSignificantDecimals = async (
    tokenId: string,
  ): Promise<number | undefined> => {
    this.logger.debug(`Fetching significant decimals for tokenId: ${tokenId}`);
    const token = await this.dataSource.getRepository(TokenEntity).findOne({
      where: { id: tokenId },
      select: { significantDecimal: true },
    });

    if (!token) {
      this.logger.debug(`Token with id ${tokenId} not found`);
      return;
    }

    this.logger.debug(
      `Token ${tokenId} has significant decimals: ${token.significantDecimal}`,
    );
    return token.significantDecimal;
  };
}
