import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { MetricAction } from '../../lib/actions';
import { METRIC_KEYS } from '../../lib/constants';
import { MetricEntity } from '../../lib/entities';
import { createDatabase } from '../utils';

describe('MetricAction', () => {
  let dataSource: DataSource;
  let action: MetricAction;
  let repository: Repository<MetricEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new MetricAction(dataSource);
    repository = dataSource.getRepository(MetricEntity);
  });

  /**
   * @target upsertMetric should insert a new metric when key does not exist
   * @dependency database
   * @scenario
   * - call upsertMetric with a new key
   * @expected
   * - metric record is inserted with correct value and timestamp
   */
  it('should insert a new metric when key does not exist', async () => {
    const timestamp = 1_000;

    await action.upsertMetric(METRIC_KEYS.NUMBER_OF_NETWORKS, '7', timestamp);

    const record = await repository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_NETWORKS },
    });

    expect(record).not.toBeNull();
    expect(record?.value).toBe('7');
    expect(record?.updatedAt).toBe(timestamp);
  });

  /**
   * @target upsertMetric should update value and timestamp when key exists
   * @dependency database
   * @scenario
   * - insert a metric record
   * - call upsertMetric with same key and different value
   * @expected
   * - existing record is updated
   */
  it('should update value and timestamp when key exists', async () => {
    await repository.insert({
      key: METRIC_KEYS.NUMBER_OF_TOKENS,
      value: '10',
      updatedAt: 1_000,
    });

    await action.upsertMetric(METRIC_KEYS.NUMBER_OF_TOKENS, '12', 2_000);

    const record = await repository.findOne({
      where: { key: METRIC_KEYS.NUMBER_OF_TOKENS },
    });

    expect(record).not.toBeNull();
    expect(record?.value).toBe('12');
    expect(record?.updatedAt).toBe(2_000);
  });

  /**
   * @target upsertMetric should use current timestamp when timestamp is not provided
   * @dependency database
   * @scenario
   * - call upsertMetric without timestamp
   * @expected
   * - updatedAt is set to a value close to current time
   */
  it('should use current timestamp when timestamp is not provided', async () => {
    const before = Math.floor(Date.now() / 1000);

    await action.upsertMetric(METRIC_KEYS.RSN_PRICE_USD, '0.123');

    const after = Math.floor(Date.now() / 1000);

    const record = await repository.findOne({
      where: { key: METRIC_KEYS.RSN_PRICE_USD },
    });

    expect(record).not.toBeNull();
    expect(Number(record!.updatedAt)).toBeGreaterThanOrEqual(before);
    expect(Number(record!.updatedAt)).toBeLessThanOrEqual(after);
  });

  /**
   * @target getMetricByKey should return metric when key exists
   * @dependency database
   * @scenario
   * - insert a metric record
   * - call getMetricByKey with existing key
   * @expected
   * - return MetricEntity
   */
  it('should return metric when key exists', async () => {
    await repository.insert({
      key: METRIC_KEYS.NUMBER_OF_NETWORKS,
      value: '5',
      updatedAt: 1_000,
    });

    const result = await action.getMetricByKey(METRIC_KEYS.NUMBER_OF_NETWORKS);

    expect(result).not.toBeNull();
    expect(result?.value).toBe('5');
  });

  /**
   * @target getMetricByKey should return null when key does not exist
   * @dependency database
   * @scenario
   * - call getMetricByKey with non-existing key
   * @expected
   * - return null
   */
  it('should return null when key does not exist', async () => {
    const result = await action.getMetricByKey(METRIC_KEYS.NUMBER_OF_NETWORKS);

    expect(result).toBeNull();
  });
});
