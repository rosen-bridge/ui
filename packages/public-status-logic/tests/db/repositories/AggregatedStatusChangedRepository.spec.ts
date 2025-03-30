import { TxType } from '../../../src/constants';
import { AggregatedStatusChangedRepository } from '../../../src/db/repositories/AggregatedStatusChangedRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  mockAggregatedStatusChangedRecords,
  id0,
  id1,
  id3,
  txEntityRecord,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('AggregatedStatusChangedRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
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
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate AggregatedStatusChangedEntity table with multiple records
     * - call getLast for multiple ids
     * @expected
     * - for id0 should have returned the status1 object
     * - for id1 should have returned the status2 object
     * - for id3 should have returned null
     */
    it('should return the last AggregatedStatusChanged record', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      await DataSourceMock.populateAggregatedStatusChanged(
        mockAggregatedStatusChangedRecords,
      );

      const status1 = mockAggregatedStatusChangedRecords[1];
      const status2 = mockAggregatedStatusChangedRecords[2];

      // act
      const lastStatus0 = await AggregatedStatusChangedRepository.getLast(id0);
      const lastStatus1 = await AggregatedStatusChangedRepository.getLast(id1);
      const lastStatus3 = await AggregatedStatusChangedRepository.getLast(id3);

      // assert
      expect(lastStatus0).toEqual({ ...status1, id: 2, tx: txEntityRecord });
      expect(lastStatus1).toEqual({ ...status2, id: 3 });
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
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate AggregatedStatusChangedEntity table with multiple records
     * - call getMany for multiple ids
     * @expected
     * - for id0 should have returned 2 records
     * - for id1 should have returned 1 record
     * - for id3 should have returned an empty array
     */
    it('should return array of AggregatedStatusChanged records', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      const status0 = mockAggregatedStatusChangedRecords[0];
      const status1 = mockAggregatedStatusChangedRecords[1];
      const status2 = mockAggregatedStatusChangedRecords[2];

      await DataSourceMock.populateAggregatedStatusChanged(
        mockAggregatedStatusChangedRecords,
      );

      // act
      const records0 = await AggregatedStatusChangedRepository.getMany(id0);
      const records1 = await AggregatedStatusChangedRepository.getMany(id1);
      const records2 = await AggregatedStatusChangedRepository.getMany(id3);

      // assert
      expect(records0).toHaveLength(2);
      expect(records0[0]).toEqual({ ...status1, id: 2, tx: txEntityRecord });
      expect(records0[1]).toEqual({ ...status0, id: 1 });
      expect(records1).toHaveLength(1);
      expect(records1[0]).toEqual({ ...status2, id: 3 });
      expect(records2).toHaveLength(0);
    });
  });

  describe('insertOne', () => {
    /**
     * @target AggregatedStatusChangedRepository.insertOne should insert record in database when status is changed
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
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
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      const status0 = mockAggregatedStatusChangedRecords[0];
      const status1 = mockAggregatedStatusChangedRecords[1];

      const repositoryInsertSpy = vi.spyOn(
        AggregatedStatusChangedRepository,
        'insert',
      );

      // act
      await AggregatedStatusChangedRepository.insertOne(
        status0.eventId,
        status0.insertedAt,
        status0.status,
        status0.txStatus,
        status0.tx ?? undefined,
      );
      await AggregatedStatusChangedRepository.insertOne(
        status1.eventId,
        status1.insertedAt,
        status1.status,
        status1.txStatus,
        status1.tx ?? undefined,
      );
      const records = await AggregatedStatusChangedRepository.find({
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });

      // assert
      expect(repositoryInsertSpy).toHaveBeenCalledTimes(2);
      expect(repositoryInsertSpy.mock.calls[0][0]).toEqual({
        ...status0,
        id: 1, // TODO: fix spy issue
        tx: null,
      });
      expect(repositoryInsertSpy.mock.calls[1][0]).toEqual({
        ...status1,
        id: 2, // TODO: fix spy issue
      });

      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({ ...status1, id: 2, tx: txEntityRecord });
      expect(records[1]).toEqual({ ...status0, id: 1 });
    });

    /**
     * @target AggregatedStatusChangedRepository.insertOne should throw when `aggregated status changed` record exist in database and its status is not changed
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
     * - call insertOne to populate database with 2 different records
     * - spy on AggregatedStatusChangedRepository.insert
     * - call insertOne again with the same values
     * - get db records
     * @expected
     * - both insertOne calls should have thrown `aggregated_status_not_changed` error
     * - repositoryInsertSpy should not have been called
     * - database should have contained the correct statuses
     */
    it('should throw when `aggregated status changed` record exist in database and its status is not changed', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      const status1 = mockAggregatedStatusChangedRecords[1];
      const status3 = mockAggregatedStatusChangedRecords[3];

      await AggregatedStatusChangedRepository.insertOne(
        status1.eventId,
        status1.insertedAt,
        status1.status,
        status1.txStatus,
        status1.tx ?? undefined,
      );
      await AggregatedStatusChangedRepository.insertOne(
        status3.eventId,
        status3.insertedAt,
        status3.status,
        status3.txStatus,
        status3.tx ?? undefined,
      );

      const repositoryInsertSpy = vi.spyOn(
        AggregatedStatusChangedRepository,
        'insert',
      );

      // act and assert
      await expect(async () => {
        await AggregatedStatusChangedRepository.insertOne(
          status3.eventId,
          status3.insertedAt + 5,
          status3.status,
          status3.txStatus,
          status3.tx ?? undefined,
        );
      }).rejects.toThrowError('aggregated_status_not_changed');
      await expect(async () => {
        await AggregatedStatusChangedRepository.insertOne(
          status1.eventId,
          status1.insertedAt + 5,
          status1.status,
          status1.txStatus,
          status1.tx ?? undefined,
        );
      }).rejects.toThrowError('aggregated_status_not_changed');

      const records = await AggregatedStatusChangedRepository.find({
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });

      expect(repositoryInsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({ ...status1, id: 1, tx: txEntityRecord });
      expect(records[1]).toEqual({ ...status3, id: 2 });
    });
  });
});
