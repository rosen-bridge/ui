import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity } from '@rosen-ui/asset-calculator';

export class LockedAssetsMetricAction {
  readonly logger: AbstractLogger;

  constructor(
    private readonly dataSource: DataSource,
    logger?: AbstractLogger,
  ) {
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * Fetch all locked assets from the database.
   *
   * @returns Promise resolving to an array of LockedAssetEntity
   */
  getLockedAssets = async (): Promise<LockedAssetEntity[]> => {
    return this.dataSource.getRepository(LockedAssetEntity).find();
  };

  /**
   * Fetch the latest prices for the given token IDs.
   *
   * @param tokenIds Array of token IDs to fetch prices for
   * @returns Promise resolving to an array of TokenPriceEntity
   */
  getLatestTokenPrices = async (
    tokenIds: string[],
  ): Promise<TokenPriceEntity[]> => {
    const timestamp = Math.floor(Date.now() / 1000);
    return this.dataSource
      .getRepository(TokenPriceEntity)
      .createQueryBuilder('tp')
      .where('tp.tokenId IN (:...tokenIds)', { tokenIds })
      .andWhere('tp.timestamp <= :timestamp', { timestamp })
      .orderBy('tp.tokenId')
      .addOrderBy('tp.timestamp', 'DESC')
      .getMany();
  };
}
