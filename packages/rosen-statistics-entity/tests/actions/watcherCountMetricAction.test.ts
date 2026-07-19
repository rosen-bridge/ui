import { beforeEach, describe, expect, it } from 'vitest';

import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';

import { WatcherCountEntity, WatcherCountMetricAction } from '../../lib';
import { upsertWatcherCountScenarios } from '../testData';
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

      await action.upsertWatcherCount(scenario.upsertData);

      const allRecords = await watcherRepo.find({
        select: ['network', 'count'],
      });

      expect(allRecords).toHaveLength(scenario.expectedCount);
      expect(allRecords).toEqual(scenario.expectedRecord);
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

      await action.upsertWatcherCount(scenario.upsertData);

      const allRecords = await watcherRepo.find({
        select: ['network', 'count'],
      });
      expect(allRecords).toHaveLength(scenario.expectedCount);
      expect(allRecords).toEqual(scenario.expectedRecord);
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

      await action.upsertWatcherCount(scenario.upsertData);

      const allRecords = await watcherRepo.find({
        select: ['network', 'count'],
      });
      expect(allRecords).toHaveLength(scenario.expectedCount);
      expect(allRecords).toEqual(scenario.expectedRecords);
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

      await action.upsertWatcherCount(scenario.upsertOperations);

      const allRecords = await watcherRepo.find({
        select: ['network', 'count'],
      });
      expect(allRecords).toHaveLength(scenario.expectedCount);
      expect(allRecords).toEqual(scenario.expectedRecord);
    });
  });
});
