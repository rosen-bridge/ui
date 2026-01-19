import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { TokenPriceEntity } from '@rosen-bridge/token-price-entity';
import { TokenMap } from '@rosen-bridge/tokens';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';
import { MetricEntity, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { WatcherCountMetricAction } from '@rosen-ui/rosen-statistics-entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { generalMetrics } from '../../lib/jobs';
import { eventTriggerData, tokenData, tokenMapData } from '../test-data';
import { createDatabase } from '../utils';

describe('generalMetrics', () => {
  let dataSource: DataSource;
  let metricRepository: Repository<MetricEntity>;
  let tokenPriceRepository: Repository<TokenPriceEntity>;
  let tokenMap: TokenMap;
  let tokenRepository: Repository<TokenEntity>;
  let lockedAssetRepository: Repository<LockedAssetEntity>;
  let eventTriggerRepository: Repository<EventTriggerEntity>;

  beforeEach(async () => {
    vi.spyOn(
      WatcherCountMetricAction.prototype,
      'calculateAndStoreWatcherCounts',
    ).mockResolvedValue(undefined);
    dataSource = await createDatabase();
    await dataSource.synchronize(true);
    metricRepository = dataSource.getRepository(MetricEntity);
    tokenPriceRepository = dataSource.getRepository(TokenPriceEntity);
    tokenRepository = dataSource.getRepository(TokenEntity);
    lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
    eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
    tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(tokenMapData);
  });

  /**
   * @target generalMetrics should persist network and supported token counts, RSN price, locked assets USD, event counts, and user counts
   * @dependency database, TokenMap
   * @scenario
   * - insert RSN price into database
   * - insert tokens and locked assets into database
   * - insert EventTriggerEntity records
   * - TokenMap returns a list of networks
   * - TokenMap returns a list of supported tokens
   * - call generalMetrics
   * @expected
   * - NUMBER_OF_NETWORKS metric is stored
   * - NUMBER_OF_SUPPORTED_TOKENS metric is stored
   * - RSN_PRICE_USD metric is stored
   * - LOCKED_ASSETS_USD metric is stored with correct value
   * - EVENT_COUNT_TOTAL metric is stored with correct value
   * - USER_COUNT_TOTAL metric is stored with correct value
   */
  it('should persist network and supported token counts, RSN price, locked assets USD, event counts, and user counts', async () => {
    const safeTimestamp = Math.floor(Date.now() / 1000) - 86400;

    await tokenPriceRepository.insert({
      tokenId: 'test-token-id',
      price: 0.25,
      timestamp: safeTimestamp,
    });

    await tokenRepository.insert(tokenData);

    await lockedAssetRepository.insert([
      { address: 'addr1', tokenId: 'token-1', amount: BigInt(10) },
      { address: 'addr2', tokenId: 'token-2', amount: BigInt(5) },
    ]);

    await tokenPriceRepository.insert([
      { tokenId: 'token-1', price: 2, timestamp: 1_000 },
      { tokenId: 'token-2', price: 4, timestamp: 1_000 },
    ]);

    await eventTriggerRepository.insert(eventTriggerData);

    await generalMetrics(dataSource, tokenMap, 'test-token-id', {
      type: 'node',
      rwtTokenId: 'test-rwt-tokenId',
      url: 'test-node-url',
    });

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

    const eventCountMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.EVENT_COUNT_TOTAL },
    });

    const userCountMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.USER_COUNT_TOTAL },
    });

    expect(networksMetric?.value).toBe('2');
    expect(tokensMetric?.value).toBe('3');
    expect(rsnMetric).not.toBeNull();
    expect(rsnMetric?.value).toBe('0.25');
    expect(lockedMetric).not.toBeNull();
    expect(lockedMetric?.value).toBe('40');
    expect(eventCountMetric).not.toBeNull();
    expect(eventCountMetric?.value).toBe('3');
    expect(userCountMetric).not.toBeNull();
    expect(userCountMetric?.value).toBe('2');
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
    await generalMetrics(dataSource, tokenMap, 'test-token-id', {
      type: 'node',
      rwtTokenId: 'test-rwt-tokenId',
      url: 'test-node-url',
    });

    const rsnMetric = await metricRepository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    expect(rsnMetric).toBeNull();
  });
});
