import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('upsertMetric', () => {
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
      vi.setSystemTime(timestamp * 1000);

      await action.upsertMetric(METRIC_KEYS.NUMBER_OF_NETWORKS, '7');

      const record = await repository.find({
        where: { key: METRIC_KEYS.NUMBER_OF_NETWORKS },
      });

      expect(record).not.toBeNull();
      expect(record.length).toBe(1);
      expect(record[0]?.value).toBe('7');
      expect(record[0]?.updatedAt).toBe(timestamp);
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

      const newTimestamp = 2_000;
      vi.setSystemTime(newTimestamp * 1000);

      await action.upsertMetric(METRIC_KEYS.NUMBER_OF_TOKENS, '12');

      const record = await repository.find({
        where: { key: METRIC_KEYS.NUMBER_OF_TOKENS },
      });

      expect(record).not.toBeNull();
      expect(record.length).toBe(1);
      expect(record[0]?.value).toBe('12');
      expect(record[0]?.updatedAt).toBe(newTimestamp);
    });

    /**
     * @target upsertMetric should use current timestamp when timestamp is not provided
     * @dependency database
     * @scenario
     * - set system time to a specific value
     * - call upsertMetric without timestamp
     * @expected
     * - updatedAt is set to the mocked timestamp
     */
    it('should use current timestamp when timestamp is not provided', async () => {
      const mockTimestamp = 1_700_000_000;
      vi.setSystemTime(mockTimestamp * 1000);

      await action.upsertMetric(METRIC_KEYS.RSN_PRICE_USD, '0.123');

      const record = await repository.find({
        where: { key: METRIC_KEYS.RSN_PRICE_USD },
      });

      expect(record).not.toBeNull();
      expect(record.length).toBe(1);
      expect(record[0]?.updatedAt).toBe(mockTimestamp);
    });
  });

  describe('getMetricByKey', () => {
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

      const result = await action.getMetricByKey(
        METRIC_KEYS.NUMBER_OF_NETWORKS,
      );

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
      const result = await action.getMetricByKey(
        METRIC_KEYS.NUMBER_OF_NETWORKS,
      );

      expect(result).toBeNull();
    });
  });
});
