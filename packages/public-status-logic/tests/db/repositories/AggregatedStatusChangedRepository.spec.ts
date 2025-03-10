import { describe, beforeEach, it, expect, vi } from 'vitest';

import { TxStatus, TxType } from '../../../src/constants';
import { AggregatedStatusChangedRepository } from '../../../src/db/repositories/AggregatedStatusChangedRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  fakeAggregatedStatusChangedRecords,
  id0,
  id1,
  id3,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('AggregatedStatusChangedRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
    // insert a fake tx, required to satisfy relation
    await TxRepository.insertOne(id1, id1, 0, TxType.reward);
  });

  describe('getLast', () => {
    /**
     * @target AggregatedStatusChangedRepository.getLast should return null if no record is available
     * @dependencies
     * @scenario
     * - call getLast
     * @expected
     * - should have returned null
     */
    it('should return null if no record is available', async () => {
      // act
      const lastStatus = await AggregatedStatusChangedRepository.getLast(id0);

      // assert
      expect(lastStatus).toBeNull();
    });

    /**
     * @target AggregatedStatusChangedRepository.getLast should return the last AggregatedStatusChanged record
     * @dependencies
     * @scenario
     * - populate AggregatedStatusChanged with multiple records
     * - call getLast for multiple ids
     * @expected
     * - should have returned the correct values
     */
    it('should return the last AggregatedStatusChanged record', async () => {
      // arrange
      await DataSourceMock.populateAggregatedStatusChanged(
        fakeAggregatedStatusChangedRecords,
      );

      const status1 = fakeAggregatedStatusChangedRecords[1];
      const status2 = fakeAggregatedStatusChangedRecords[2];

      // act
      const lastStatus0 = await AggregatedStatusChangedRepository.getLast(id0);
      const lastStatus1 = await AggregatedStatusChangedRepository.getLast(id1);
      const lastStatus3 = await AggregatedStatusChangedRepository.getLast(id3);

      // assert
      expect(lastStatus0).toMatchObject(status1);
      expect(lastStatus1).toMatchObject(status2);
      expect(lastStatus3).toBeNull();
    });
  });

  describe('getMany', () => {
    /**
     * @target AggregatedStatusChangedRepository.getMany should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records = await AggregatedStatusChangedRepository.getMany(id0);

      // assert
      expect(records).toHaveLength(0);
    });

    /**
     * @target AggregatedStatusChangedRepository.getMany should return array of AggregatedStatusChanged records
     * @dependencies
     * @scenario
     * - populate AggregatedStatusChanged
     * - call getMany for multiple ids
     * @expected
     * - should have returned correct values
     */
    it('should return array of AggregatedStatusChanged records', async () => {
      // arrange
      await DataSourceMock.populateAggregatedStatusChanged(
        fakeAggregatedStatusChangedRecords,
      );

      // act
      const records0 = await AggregatedStatusChangedRepository.getMany(id0);
      const records1 = await AggregatedStatusChangedRepository.getMany(id1);

      // assert
      expect(records0).toHaveLength(2);
      expect(records1).toHaveLength(1);
    });
  });

  describe('insertOne', () => {
    /**
     * @target AggregatedStatusChangedRepository.insertOne should insert record in database when status is changed
     * @dependencies
     * @scenario
     * - spy on AggregatedStatusChangedRepository.insert
     * - call insertOne
     * - call insertOne again with a new status
     * - get db records
     * @expected
     * - repositoryInsertSpy should have been called with the correct arguments
     * - database should have contained the correct statuses
     */
    it('should insert record in database when status is changed', async () => {
      // arrange
      const status0 = fakeAggregatedStatusChangedRecords[0];
      const status1 = fakeAggregatedStatusChangedRecords[1];

      const repositoryInsertSpy = vi.spyOn(
        AggregatedStatusChangedRepository,
        'insert',
      );

      // act
      await AggregatedStatusChangedRepository.insertOne(
        status0.eventId,
        status0.insertedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await AggregatedStatusChangedRepository.insertOne(
        status1.eventId,
        status1.insertedAt,
        status1.status,
        status1.tx?.txId,
        status1.txStatus ?? undefined,
      );
      const records =
        await AggregatedStatusChangedRepository.createQueryBuilder('record')
          .leftJoinAndSelect('record.tx', 'tx')
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      // assert
      expect(repositoryInsertSpy).toHaveBeenCalledTimes(2);
      expect(repositoryInsertSpy).toHaveBeenNthCalledWith(1, {
        ...status0,
        id: 1, // TODO: fix spy issue
        tx: undefined,
        txStatus: undefined,
      });
      expect(repositoryInsertSpy).toHaveBeenNthCalledWith(2, {
        ...status1,
        id: 2, // TODO: fix spy issue
        tx: { txId: id1 },
        txStatus: TxStatus.signed,
      });

      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status1);
      expect(records[1]).toMatchObject(status0);
    });

    /**
     * @target AggregatedStatusChangedRepository.insertOne should not insert record in database when status is not changed
     * @dependencies
     * @scenario
     * - call insertOne to populate database with 2 different records
     * - spy on AggregatedStatusChangedRepository.insert
     * - call insertOne again with the same values
     * - get db records
     * @expected
     * - repositoryInsertSpy should not have been called
     * - database should have contained the correct statuses
     */
    it('should not insert record in database when status is not changed', async () => {
      // arrange
      const status1 = fakeAggregatedStatusChangedRecords[1];
      const status3 = fakeAggregatedStatusChangedRecords[3];

      await AggregatedStatusChangedRepository.insertOne(
        status1.eventId,
        status1.insertedAt,
        status1.status,
        status1.tx?.txId,
        status1.txStatus ?? undefined,
      );
      await AggregatedStatusChangedRepository.insertOne(
        status3.eventId,
        status3.insertedAt,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );

      const repositoryInsertSpy = vi.spyOn(
        AggregatedStatusChangedRepository,
        'insert',
      );

      // act
      await AggregatedStatusChangedRepository.insertOne(
        status3.eventId,
        status3.insertedAt + 5,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );
      await AggregatedStatusChangedRepository.insertOne(
        status1.eventId,
        status1.insertedAt + 5,
        status1.status,
        status1.tx?.txId,
        status1.txStatus ?? undefined,
      );
      const records =
        await AggregatedStatusChangedRepository.createQueryBuilder('record')
          .leftJoinAndSelect('record.tx', 'tx')
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      // assert
      expect(repositoryInsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status1);
      expect(records[1]).toMatchObject(status3);
    });
  });
});
