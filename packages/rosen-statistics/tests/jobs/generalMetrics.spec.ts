import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { TokenMap } from '@rosen-bridge/tokens';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { MetricEntity, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { generalMetrics } from '../../lib/jobs';
import { tokenMapData } from '../test-data';
import { createDatabase } from '../utils';

describe('generalMetrics', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let tokenPriceRepository: Repository<TokenPriceEntity>;
  let tokenMap: TokenMap;
  let tokenRepository: Repository<TokenEntity>;
  let lockedAssetRepository: Repository<LockedAssetEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    tokenPriceRepository = dataSource.getRepository(TokenPriceEntity);
    tokenRepository = dataSource.getRepository(TokenEntity);
    lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
    tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(tokenMapData);
  });

  /**
   * @target generalMetrics should persist network and token counts and store RSN price metric when price exists and calculate locked assets USD
   * @dependency database, TokenMap
   * @scenario
   * - insert RSN price into database
   * - insert tokens and locked assets into database
   * - TokenMap returns a list of networks
   * - TokenMap returns a list of supported tokens
   * - call generalMetrics
   * @expected
   * - NUMBER_OF_NETWORKS metric is stored
   * - NUMBER_OF_SUPPORTED_TOKENS metric is stored
   * - RSN_PRICE_USD metric is stored
   * - LOCKED_ASSETS_USD metric is stored with correct value
   */
  it('should persist network and supported token counts and store RSN price metric when price exists and calculate locked assets USD', async () => {
    const safeTimestamp = Math.floor(Date.now() / 1000) - 86400;

    await tokenPriceRepository.insert({
      tokenId: 'test-token-id',
      price: 0.25,
      timestamp: safeTimestamp,
    });

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

    await lockedAssetRepository.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    await tokenPriceRepository.insert([
      { tokenId: 'token-1', price: 2, timestamp: 1_000 },
      { tokenId: 'token-2', price: 4, timestamp: 1_000 },
    ]);

    await generalMetrics(dataSource, tokenMap, 'test-token-id');

    const networksMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_NETWORKS },
    });

    const tokensMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_TOKENS },
    });

    const rsnMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    const lockedMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(networksMetric?.value).toBe('2');
    expect(tokensMetric?.value).toBe('3');
    expect(rsnMetric).not.toBeNull();
    expect(rsnMetric?.value).toBe('0.25');
    expect(lockedMetric).not.toBeNull();
    expect(lockedMetric?.value).toBe('40');
  });

  /**
   * @target generalMetrics should not store RSN price when price does not exist
   * @dependency database
   * @scenario
   * - no RSN price exists in database
   * - call generalMetrics
   * @expected
   * - RSN_PRICE_USD metric is not stored
   */
  it('should not store RSN price metric when price does not exist', async () => {
    await generalMetrics(dataSource, tokenMap, 'test-token-id');

    const rsnMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    expect(rsnMetric).toBeNull();
  });
});
