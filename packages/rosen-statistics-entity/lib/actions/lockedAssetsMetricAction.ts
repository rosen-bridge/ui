import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { LockedAssetEntity } from '@rosen-ui/asset-calculator';

import { LockedAssetsType } from '../types';

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
   * Fetches all locked assets
   *
   * @returns A promise that resolves to an array of LockedAssetsType
   */
  getLockedAssets = async (): Promise<LockedAssetsType[]> => {
    const lockedAssets = await this.dataSource
      .getRepository(LockedAssetEntity)
      .createQueryBuilder('la')
      .leftJoinAndSelect('la.token', 'token')
      .select(['la.tokenId', 'la.amount', 'token.significantDecimal'])
      .getMany();

    this.logger.debug(`Found ${lockedAssets.length} locked assets`);
    return lockedAssets.map((asset) => ({
      tokenId: asset.tokenId,
      amount: asset.amount,
      significantDecimal: asset.token.significantDecimal,
    }));
  };
}
