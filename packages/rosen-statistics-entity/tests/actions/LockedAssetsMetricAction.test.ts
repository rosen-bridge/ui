import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { describe, it, expect, beforeEach } from 'vitest';

import { LockedAssetsMetricAction } from '../../lib/actions/LockedAssetsMetricAction';
import { METRIC_KEYS } from '../../lib/constants';
import { MetricEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('LockedAssetsMetricAction', () => {
  let dataSource: DataSource;
  let action: LockedAssetsMetricAction;
  let metricRepo: Repository<MetricEntity>;
  let lockedAssetRepo: Repository<LockedAssetEntity>;
  let tokenPriceRepo: Repository<TokenPriceEntity>;
  let tokenRepo: Repository<TokenEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new LockedAssetsMetricAction(dataSource);

    metricRepo = dataSource.getRepository(MetricEntity);
    lockedAssetRepo = dataSource.getRepository(LockedAssetEntity);
    tokenPriceRepo = dataSource.getRepository(TokenPriceEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
  });

  /**
   * @target calculateAndStoreLockedAssetsUsd should calculate and store total locked assets USD value
   * @dependency database
   * @scenario
   * - insert tokens first
   * - insert locked assets with different tokenIds
   * - insert latest token prices
   * - call calculateAndStoreLockedAssetsUsd
   * @expected
   * - metric LOCKED_ASSETS_USD is stored with correct summed value
   */
  it('should calculate and store total locked assets USD value', async () => {
    await tokenRepo.insert([
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

    await lockedAssetRepo.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    await tokenPriceRepo.insert([
      { tokenId: 'token-1', price: 2, timestamp: 1_000 },
      { tokenId: 'token-1', price: 10, timestamp: 2_000 },
      { tokenId: 'token-2', price: 4, timestamp: 1_000 },
    ]);

    await action.calculateAndStoreLockedAssetsUsd();

    const metric = await metricRepo.find({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('120'); // (10*10) + (5*4)
  });

  /**
   * @target calculateAndStoreLockedAssetsUsd should skip locked assets without price
   * @dependency database
   * @scenario
   * - insert token
   * - insert locked asset
   * - do not insert token price
   * - call calculateAndStoreLockedAssetsUsd
   * @expected
   * - metric is not created
   */
  it('should skip locked assets without price', async () => {
    await tokenRepo.insert({
      id: 'token-1',
      name: 'Token 1',
      decimal: 0,
      significantDecimal: 0,
      isNative: false,
      chain: 'ergo',
    });

    await lockedAssetRepo.insert({
      address: 'addr1',
      tokenId: 'token-1',
      amount: BigInt(10),
    });

    await action.calculateAndStoreLockedAssetsUsd();

    const metric = await metricRepo.findOne({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(metric).toBeNull();
  });

  /**
   * @target calculateAndStoreLockedAssetsUsd should update existing locked assets metric
   * @dependency database
   * @scenario
   * - insert existing LOCKED_ASSETS_USD metric
   * - insert token
   * - insert locked assets and prices
   * - call calculateAndStoreLockedAssetsUsd
   * @expected
   * - metric value is updated
   */
  it('should update existing locked assets metric', async () => {
    await metricRepo.insert({
      key: METRIC_KEYS.LOCKED_ASSETS_USD,
      value: '100',
      updatedAt: 1_000,
    });

    await tokenRepo.insert({
      id: 'token-1',
      name: 'Token 1',
      decimal: 0,
      significantDecimal: 0,
      isNative: false,
      chain: 'ergo',
    });

    await lockedAssetRepo.insert({
      address: 'addr1',
      tokenId: 'token-1',
      amount: BigInt(3),
    });

    await tokenPriceRepo.insert({
      tokenId: 'token-1',
      price: 10,
      timestamp: 2_000,
    });

    await action.calculateAndStoreLockedAssetsUsd();

    const metric = await metricRepo.find({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(metric).not.toBeNull();
    expect(metric.length).toBe(1);
    expect(metric[0]?.value).toBe('30');
  });
});
