import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { TokenMap } from '@rosen-bridge/tokens';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { MetricEntity, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { generalMetrics } from '../../lib/jobs';
import { createDatabase } from '../utils';

describe('generalMetrics', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let tokenPriceRepository: Repository<TokenPriceEntity>;
  let lockedAssetRepository: Repository<LockedAssetEntity>;
  let tokenRepository: Repository<TokenEntity>;
  let tokenMap: TokenMap;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);

    metricRepository = dataSource.getRepository(MetricEntity);
    tokenPriceRepository = dataSource.getRepository(TokenPriceEntity);
    lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
    tokenRepository = dataSource.getRepository(TokenEntity);

    tokenMap = {
      getAllChains: vi.fn(),
      getConfig: vi.fn(),
    } as unknown as TokenMap;
  });

  /**
   * @target generalMetrics should persist network and token counts
   * @dependency database, TokenMap
   * @scenario
   * - TokenMap returns a list of networks
   * - TokenMap returns a list of supported tokens
   * - call generalMetrics
   * @expected
   * - NUMBER_OF_NETWORKS metric is stored
   * - NUMBER_OF_SUPPORTED_TOKENS metric is stored
   */
  it('should persist network and supported token counts', async () => {
    tokenMap.getAllChains = vi.fn().mockReturnValue(['ergo', 'cardano']);
    tokenMap.getConfig = vi.fn().mockReturnValue([{}, {}, {}]);

    await generalMetrics(dataSource, tokenMap, 'test-token-id');

    const networksMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_NETWORKS },
    });

    const tokensMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_TOKENS },
    });

    expect(networksMetric?.value).toBe('2');
    expect(tokensMetric?.value).toBe('3');
  });

  /**
   * @target generalMetrics should store RSN price when available
   * @dependency database
   * @scenario
   * - insert RSN price into database
   * - call generalMetrics
   * @expected
   * - RSN_PRICE_USD metric is stored
   */
  it('should store RSN price metric when price exists', async () => {
    const safeTimestamp = Math.floor(Date.now() / 1000) - 86401;

    tokenMap.getAllChains = vi.fn().mockReturnValue(['ergo']);
    tokenMap.getConfig = vi.fn().mockReturnValue([{}]);

    await tokenPriceRepository.insert({
      tokenId: 'test-token-id',
      price: 0.25,
      timestamp: safeTimestamp,
    });

    await generalMetrics(dataSource, tokenMap, 'test-token-id');

    const rsnMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    expect(rsnMetric).not.toBeNull();
    expect(rsnMetric?.value).toBe('0.25');
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
    tokenMap.getAllChains = vi.fn().mockReturnValue(['ergo']);
    tokenMap.getConfig = vi.fn().mockReturnValue([{}]);

    await generalMetrics(dataSource, tokenMap, 'test-token-id');

    const rsnMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    expect(rsnMetric).toBeNull();
  });

  /**
   * @target generalMetrics should calculate locked assets USD
   * @dependency database, LockedAssetsMetricAction
   * @scenario
   * - insert tokens required by locked assets (fix FK + NOT NULL)
   * - insert locked assets
   * - insert token prices
   * - call generalMetrics
   * @expected
   * - LOCKED_ASSETS_USD metric is created with correct value
   */
  it('should calculate and store locked assets USD metric', async () => {
    tokenMap.getAllChains = vi.fn().mockReturnValue(['ergo']);
    tokenMap.getConfig = vi.fn().mockReturnValue([{}]);

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

    const lockedMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.LOCKED_ASSETS_USD },
    });

    expect(lockedMetric).not.toBeNull();
    expect(lockedMetric?.value).toBe('40'); // (10*2) + (5*4)
  });
});
