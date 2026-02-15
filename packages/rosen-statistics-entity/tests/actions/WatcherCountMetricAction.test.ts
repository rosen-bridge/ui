import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { WatcherCountEntity, WatcherCountMetricAction } from '../../lib';
import {
  getWatcherCountScenarios,
  upsertWatcherCountScenarios,
} from '../test-data';
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
