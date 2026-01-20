import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { TokenMap } from '@rosen-bridge/tokens';
import { MetricEntity } from '@rosen-ui/rosen-statistics-entity';
import { METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach } from 'vitest';

import { generalMetrics } from '../../lib/jobs';
import { tokenMapData } from '../test-data';
import { createDatabase } from '../utils';

describe('generalMetrics', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let tokenPriceRepository: Repository<TokenPriceEntity>;
  let tokenMap: TokenMap;

  beforeEach(async () => {
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    tokenPriceRepository = dataSource.getRepository(TokenPriceEntity);
    tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(tokenMapData);
  });

  /**
   * @target generalMetrics should persist network and token counts and store RSN price metric when price exists
   * @dependency database, TokenMap
   * @scenario
   * - insert RSN price into database
   * - TokenMap returns a list of networks
   * - TokenMap returns a list of supported tokens
   * - call generalMetrics
   * @expected
   * - NUMBER_OF_NETWORKS metric is stored
   * - NUMBER_OF_SUPPORTED_TOKENS metric is stored
   * - RSN_PRICE_USD metric is stored
   */
  it('should persist network and supported token counts and store RSN price metric when price exists', async () => {
    const safeTimestamp = Math.floor(Date.now() / 1000) - 86400;

    await tokenPriceRepository.insert({
      tokenId: 'test-token-id',
      price: 0.25,
      timestamp: safeTimestamp,
    });

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

    expect(networksMetric?.value).toBe('2');
    expect(tokensMetric?.value).toBe('3');
    expect(rsnMetric).not.toBeNull();
    expect(rsnMetric?.value).toBe('0.25');
  });

  /**
   * @target generalMetrics should update existing metrics
   * @dependency database
   * @scenario
   * - insert RSN price into database
   * - insert existing metrics into database
   * - TokenMap returns a list of networks
   * - TokenMap returns a list of supported tokens
   * - call generalMetrics
   * @expected
   * - NUMBER_OF_NETWORKS metric is updated
   * - NUMBER_OF_SUPPORTED_TOKENS metric is updated
   * - RSN_PRICE_USD metric is keept unchanged
   */
  it('should update existing metrics', async () => {
    const timestamp = Math.floor(Date.now() / 1000);

    await tokenPriceRepository.insert({
      tokenId: 'test-token-id',
      price: 0.25,
      timestamp: timestamp,
    });

    await metricRepository.insert([
      {
        key: METRIC_KEYS.NUMBER_OF_NETWORKS,
        value: '1',
        updatedAt: timestamp,
      },
      {
        key: METRIC_KEYS.NUMBER_OF_TOKENS,
        value: '1',
        updatedAt: timestamp,
      },
      {
        key: METRIC_KEYS.RSN_PRICE_USD,
        value: '0.1',
        updatedAt: timestamp,
      },
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

    expect(networksMetric?.value).toBe('2');
    expect(tokensMetric?.value).toBe('3');
    expect(rsnMetric).not.toBeNull();
    expect(rsnMetric?.value).toBe('0.1');
  });
});
