import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TxType } from '../../../src/constants';
import { AggregatedStatusRepository } from '../../../src/db/repositories/AggregatedStatusRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  fakeAggregatedStatusRecords,
  id0,
  id1,
  id2,
  id3,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('AggregatedStatusRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
    // insert a fake tx, required to satisfy relation
    await TxRepository.insertOne(id1, id1, 0, TxType.reward);
  });

  describe('getOne', () => {
    /**
     * @target AggregatedStatusRepository.getOne should return null if no record is available
     * @dependencies
     * @scenario
     * - call getOne
     * @expected
     * - should have returned null
     */
    it('should return null if no record is available', async () => {
      // act
      const currentStatus = await AggregatedStatusRepository.getOne(id0);

      // assert
      expect(currentStatus).toBeNull();
    });

    /**
     * @target AggregatedStatusRepository.getOne should return only the requested AggregatedStatusEntity record
     * @dependencies
     * @scenario
     * - populate AggregatedStatusEntity with multiple records
     * - call getOne for multiple ids
     * @expected
     * - should have returned the correct values
     */
    it('should return only the requested AggregatedStatusEntity record', async () => {
      // arrange
      await DataSourceMock.populateAggregatedStatus(
        fakeAggregatedStatusRecords,
      );

      const status0 = fakeAggregatedStatusRecords[0];
      const status1 = fakeAggregatedStatusRecords[1];

      // act
      const currentStatus0 = await AggregatedStatusRepository.getOne(id0);
      const currentStatus1 = await AggregatedStatusRepository.getOne(id1);
      const currentStatus2 = await AggregatedStatusRepository.getOne(id3);

      // assert
      expect(currentStatus0).toMatchObject(status0);
      expect(currentStatus1).toMatchObject(status1);
      expect(currentStatus2).toBeNull();
    });
  });

  describe('getMany', () => {
    /**
     * @target AggregatedStatusRepository.getMany should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getMany with different arguments
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records0 = await AggregatedStatusRepository.getMany([]);
      const records1 = await AggregatedStatusRepository.getMany([id0]);

      // assert
      expect(records0).toHaveLength(0);
      expect(records1).toHaveLength(0);
    });

    /**
     * @target AggregatedStatusRepository.getMany should return array of AggregatedStatusEntity records
     * @dependencies
     * @scenario
     * - populate AggregatedStatusEntity
     * - call getMany for multiple ids
     * @expected
     * - should have returned correct values
     */
    it('should return array of AggregatedStatusEntity records', async () => {
      // arrange
      await DataSourceMock.populateAggregatedStatus(
        fakeAggregatedStatusRecords,
      );

      const status0 = fakeAggregatedStatusRecords[0];
      const status1 = fakeAggregatedStatusRecords[1];
      const status2 = fakeAggregatedStatusRecords[2];

      // act
      const records0 = await AggregatedStatusRepository.getMany([
        id0,
        id2,
        id3,
      ]);
      const records1 = await AggregatedStatusRepository.getMany([id1]);
      const records2 = await AggregatedStatusRepository.getMany([id3]);

      // assert
      expect(records0).toHaveLength(2);
      expect(records0[0]).toMatchObject(status0);
      expect(records0[1]).toMatchObject(status2);
      expect(records1).toHaveLength(1);
      expect(records1[0]).toMatchObject(status1);
      expect(records2).toHaveLength(0);
    });
  });

  describe('upsertOne', () => {
    /**
     * @target AggregatedStatusRepository.upsertOne should insert record in database when eventId is new
     * @dependencies
     * @scenario
     * - call upsertOne with 2 different eventIds
     * - get database records
     * @expected
     * - database should have contained 2 records, one for each eventId
     */
    it('should insert record in database when eventId is new', async () => {
      // arrange
      const status0 = fakeAggregatedStatusRecords[0];
      const status2 = fakeAggregatedStatusRecords[2];

      // act
      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        status2.updatedAt,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );
      const records = await AggregatedStatusRepository.createQueryBuilder(
        'record',
      )
        .leftJoinAndSelect('record.tx', 'tx')
        .orderBy('record.updatedAt', 'DESC')
        .getMany();

      // assert
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status0);
      expect(records[1]).toMatchObject(status2);
    });

    /**
     * @target AggregatedStatusRepository.upsertOne should not update database value when status is not changed
     * @dependencies
     * @scenario
     * - call upsertOne to populate database with 2 different records
     * - spy on AggregatedStatusRepository.upsert
     * - call upsertOne again with the same values
     * - get database records
     * @expected
     * - repositoryUpsertSpy should not have been called
     * - database should have contained the initial values
     */
    it('should not update database value when status is not changed', async () => {
      // arrange
      const status0 = fakeAggregatedStatusRecords[0];
      const status2 = fakeAggregatedStatusRecords[2];

      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        status2.updatedAt,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );

      const repositoryUpsertSpy = vi.spyOn(
        AggregatedStatusRepository,
        'upsert',
      );

      // act
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        status2.updatedAt + 5,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt + 5,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      const records = await AggregatedStatusRepository.createQueryBuilder(
        'record',
      )
        .leftJoinAndSelect('record.tx', 'tx')
        .orderBy('record.updatedAt', 'DESC')
        .getMany();

      // assert
      expect(repositoryUpsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status0);
      expect(records[1]).toMatchObject(status2);
    });
  });
});
