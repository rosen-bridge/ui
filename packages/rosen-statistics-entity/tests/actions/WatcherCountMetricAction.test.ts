import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { WatcherCountMetricAction } from '../../lib/actions/WatcherCountMetricAction';
import { WatcherCountEntity } from '../../lib/entities';
import {
  getWatcherCountScenarios,
  upsertWatcherCountScenarios,
} from '../test-data/test-data';
import { createDatabase } from '../utils';

describe('WatcherCountMetricAction', () => {
  let dataSource: DataSource;
  let action: WatcherCountMetricAction;
  let watcherRepo: Repository<WatcherCountEntity>;

  beforeEach(async () => {
    dataSource = await createDatabase();
    action = new WatcherCountMetricAction(dataSource);
    watcherRepo = dataSource.getRepository(WatcherCountEntity);
  });

  describe('getWatcherCountByNetwork', () => {
    beforeEach(async () => {
      await watcherRepo.clear();
    });

    /**
     * @target getWatcherCountByNetwork should return null when no matching record exists
     * @dependency database
     * @scenario
     * - insert watcher count record
     * - call getWatcherCountByNetwork for different network
     * @expected
     * - returns null
     */
    it('should return null when no matching record exists', async () => {
      const scenario = getWatcherCountScenarios.noMatch;
      await watcherRepo.insert(scenario.watcherCountRepo);

      const result = await action.getWatcherCountByNetwork(scenario.query);
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getWatcherCountByNetwork should return existing WatcherCountEntity
     * @dependency database
     * @scenario
     * - insert watcher count record
     * - call getWatcherCountByNetwork for matching network
     * @expected
     * - returns the matching WatcherCountEntity
     */
    it('should return existing WatcherCountEntity', async () => {
      const scenario = getWatcherCountScenarios.exactMatch;
      await watcherRepo.insert(scenario.watcherCountRepo);

      const result = await action.getWatcherCountByNetwork(scenario.query);

      expect(result).not.toBeNull();
      expect(result?.network).toBe(scenario.expected?.network);
      expect(result?.count).toBe(scenario.expected?.count);
    });

    /**
     * @target getWatcherCountByNetwork should be case-sensitive
     * @dependency database
     * @scenario
     * - insert watcher count record with lowercase network
     * - call getWatcherCountByNetwork with uppercase network
     * @expected
     * - returns null (case doesn't match)
     */
    it('should be case-sensitive', async () => {
      const scenario = getWatcherCountScenarios.caseSensitive;
      await watcherRepo.insert(scenario.watcherCountRepo);

      const result = await action.getWatcherCountByNetwork(scenario.query);
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getWatcherCountByNetwork should return correct record from multiple
     * @dependency database
     * @scenario
     * - insert multiple watcher count records
     * - call getWatcherCountByNetwork for specific network
     * @expected
     * - returns the correct matching record
     */
    it('should return correct record from multiple', async () => {
      const scenario = getWatcherCountScenarios.multipleRecords;
      await watcherRepo.insert(scenario.watcherCountRepo);

      const result = await action.getWatcherCountByNetwork(scenario.query);

      expect(result).not.toBeNull();
      expect(result?.network).toBe(scenario.expected?.network);
      expect(result?.count).toBe(scenario.expected?.count);
    });

    /**
     * @target getWatcherCountByNetwork should return null for empty database
     * @dependency database
     * @scenario
     * - call getWatcherCountByNetwork on empty database
     * @expected
     * - returns null
     */
    it('should return null for empty database', async () => {
      const scenario = getWatcherCountScenarios.emptyDatabase;
      const result = await action.getWatcherCountByNetwork(scenario.query);
      expect(result).toBe(scenario.expected);
    });

    /**
     * @target getWatcherCountByNetwork should handle zero count
     * @dependency database
     * @scenario
     * - insert watcher count record with count = 0
     * - call getWatcherCountByNetwork
     * @expected
     * - returns record with zero count
     */
    it('should handle zero count', async () => {
      const scenario = getWatcherCountScenarios.zeroCount;
      await watcherRepo.insert(scenario.watcherCountRepo);

      const result = await action.getWatcherCountByNetwork(scenario.query);

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expected?.count);
    });
  });

  describe('upsertWatcherCount', () => {
    beforeEach(async () => {
      await watcherRepo.clear();
    });

    /**
     * @target upsertWatcherCount should insert new watcher count record
     * @dependency database
     * @scenario
     * - call upsertWatcherCount with new network
     * - verify record was created
     * @expected
     * - new WatcherCountEntity record is created
     */
    it('should insert new watcher count record', async () => {
      const scenario = upsertWatcherCountScenarios.insertNew;
      await watcherRepo.insert(scenario.initialData);

      await action.upsertWatcherCount(
        scenario.upsertData.network,
        scenario.upsertData.count,
      );

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await watcherRepo.findOne({
        where: { network: scenario.expectedRecord.network },
      });

      expect(result).not.toBeNull();
      expect(result?.network).toBe(scenario.expectedRecord.network);
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });

    /**
     * @target upsertWatcherCount should update existing watcher count record
     * @dependency database
     * @scenario
     * - insert existing watcher count record
     * - call upsertWatcherCount with same network but different count
     * - verify record was updated
     * @expected
     * - existing WatcherCountEntity record is updated
     */
    it('should update existing watcher count record', async () => {
      const scenario = upsertWatcherCountScenarios.updateExisting;
      await watcherRepo.insert(scenario.initialData);

      await action.upsertWatcherCount(
        scenario.upsertData.network,
        scenario.upsertData.count,
      );

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await watcherRepo.findOne({
        where: { network: scenario.expectedRecord.network },
      });

      expect(result).not.toBeNull();
      expect(result?.network).toBe(scenario.expectedRecord.network);
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });

    /**
     * @target upsertWatcherCount should handle zero count
     * @dependency database
     * @scenario
     * - call upsertWatcherCount with count = 0
     * @expected
     * - record is created with zero count
     */
    it('should handle zero count', async () => {
      const scenario = upsertWatcherCountScenarios.zeroCount;
      await watcherRepo.insert(scenario.initialData);

      await action.upsertWatcherCount(
        scenario.upsertData.network,
        scenario.upsertData.count,
      );

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await watcherRepo.findOne({
        where: { network: scenario.expectedRecord.network },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });

    /**
     * @target upsertWatcherCount should insert multiple different networks
     * @dependency database
     * @scenario
     * - insert existing watcher count records
     * - call upsertWatcherCount for new network
     * @expected
     * - new record added, existing records preserved
     */
    it('should insert multiple different networks', async () => {
      const scenario =
        upsertWatcherCountScenarios.insertMultipleDifferentNetworks;
      await watcherRepo.insert(scenario.initialData);

      await action.upsertWatcherCount(
        scenario.upsertData.network,
        scenario.upsertData.count,
      );

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      // Check all expected records exist
      for (const expectedRecord of scenario.expectedRecords) {
        const result = await watcherRepo.findOne({
          where: { network: expectedRecord.network },
        });
        expect(result).not.toBeNull();
        expect(result?.count).toBe(expectedRecord.count);
      }
    });

    /**
     * @target upsertWatcherCount should handle multiple updates to same network
     * @dependency database
     * @scenario
     * - call upsertWatcherCount multiple times with same network
     * @expected
     * - last update wins
     */
    it('should handle multiple updates to same network', async () => {
      const scenario = upsertWatcherCountScenarios.updateMultipleTimes;
      await watcherRepo.insert(scenario.initialData);

      for (const operation of scenario.upsertOperations) {
        await action.upsertWatcherCount(operation.network, operation.count);
      }

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await watcherRepo.findOne({
        where: { network: scenario.expectedRecord.network },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });

    /**
     * @target upsertWatcherCount should handle large numbers
     * @dependency database
     * @scenario
     * - call upsertWatcherCount with large count
     * @expected
     * - record is created with large count
     */
    it('should handle large numbers', async () => {
      const scenario = upsertWatcherCountScenarios.largeNumber;
      await watcherRepo.insert(scenario.initialData);

      await action.upsertWatcherCount(
        scenario.upsertData.network,
        scenario.upsertData.count,
      );

      const allRecords = await watcherRepo.find();
      expect(allRecords).toHaveLength(scenario.expectedCount);

      const result = await watcherRepo.findOne({
        where: { network: scenario.expectedRecord.network },
      });

      expect(result).not.toBeNull();
      expect(result?.count).toBe(scenario.expectedRecord.count);
    });
  });
});
