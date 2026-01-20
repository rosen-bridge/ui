import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { MetricEntity, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { lockedAssetsMetric } from '../../lib/jobs';
import { createDatabase } from '../utils';

describe('lockedAssetsMetric', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let tokenRepository: Repository<TokenEntity>;
  let lockedAssetRepository: Repository<LockedAssetEntity>;
  let tokenPriceRepository: Repository<TokenPriceEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    tokenRepository = dataSource.getRepository(TokenEntity);
    lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
    tokenPriceRepository = dataSource.getRepository(TokenPriceEntity);
  });

  /**
   * @target lockedAssetsMetric should calculate and store locked assets usd metric
   * @dependency database
   * @scenario
   * - insert tokens and locked assets into database
   * - insert token prices into database
   * - call lockedAssetsMetric
   * @expected
   * - LOCKED_ASSETS_USD metric is stored with correct value
   */
  it('should calculate and store locked assets usd metric', async () => {
    await tokenRepository.insert([
      {
        id: 'token-1',
        name: 'Token 1',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
      },
      {
        id: 'token-2',
        name: 'Token 2',
        decimal: 0,
        significantDecimal: 0,
        isNative: false,
        chain: 'ergo',
      },
    ]);

    await tokenPriceRepository.insert([
      { tokenId: 'token-1', price: 2, timestamp: 1_000 },
      { tokenId: 'token-2', price: 4, timestamp: 1_000 },
    ]);

    await lockedAssetRepository.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    await lockedAssetsMetric(dataSource);

    const lockedMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(lockedMetric).not.toBeNull();
    expect(lockedMetric?.value).toBe('40');
  });
});
