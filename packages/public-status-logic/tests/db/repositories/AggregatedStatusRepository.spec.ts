import {
  AggregateEventStatus,
  AggregateTxStatus,
  TxType,
} from '../../../src/constants';
import { AggregatedStatusRepository } from '../../../src/db/repositories/AggregatedStatusRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  mockAggregatedStatusRecords,
  id0,
  id1,
  id2,
  id3,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('AggregatedStatusRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
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
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate AggregatedStatusEntity table with multiple records
     * - call getOne for multiple ids
     * @expected
     * - for id0 should have returned the status0 object
     * - for id1 should have returned the status1 object
     * - for id3 should have returned null
     */
    it('should return only the requested AggregatedStatusEntity record', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      await DataSourceMock.populateAggregatedStatus(
        mockAggregatedStatusRecords,
      );

      const status0 = mockAggregatedStatusRecords[0];
      const status1 = mockAggregatedStatusRecords[1];

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
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate AggregatedStatusEntity table with multiple records
     * - call getMany for multiple ids
     * @expected
     * - for ids 0,2,3 should have returned 2 records
     * - for id1 should have returned 1 record
     * - for id3 should have returned an empty array
     */
    it('should return array of AggregatedStatusEntity records', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      await DataSourceMock.populateAggregatedStatus(
        mockAggregatedStatusRecords,
      );

      const status0 = mockAggregatedStatusRecords[0];
      const status1 = mockAggregatedStatusRecords[1];
      const status2 = mockAggregatedStatusRecords[2];

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
     * - populate TxEntity table with a record, required to satisfy relation
     * - call upsertOne with 2 different eventIds
     * - get database records
     * @expected
     * - database should have contained 2 records, one for each eventId
     */
    it('should insert record in database when eventId is new', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      const status0 = mockAggregatedStatusRecords[0];
      const status2 = mockAggregatedStatusRecords[2];

      // act
      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt,
        status0.status,
        status0.txStatus,
        status0.tx ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        status2.updatedAt,
        status2.status,
        status2.txStatus,
        status2.tx ?? undefined,
      );
      const records = await AggregatedStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status0);
      expect(records[1]).toMatchObject(status2);
    });

    /**
     * @target AggregatedStatusRepository.upsertOne should update record in database when eventId exists
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate AggregatedStatusEntity table with 3 records with different eventIds
     * - call upsertOne with updated values for 2 of the inserted records
     * - get database records
     * @expected
     * - database should have contained 3 records with 2 of them updated
     */
    it('should update record in database when eventId exists', async () => {
      // arrange
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      await DataSourceMock.populateAggregatedStatus(
        mockAggregatedStatusRecords,
      );

      const status0 = mockAggregatedStatusRecords[0];
      const status1 = mockAggregatedStatusRecords[1];
      const status2 = mockAggregatedStatusRecords[2];

      // act
      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        10,
        AggregateEventStatus.paymentWaiting,
        AggregateTxStatus.invalid,
        undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        20,
        AggregateEventStatus.reachedLimit,
        AggregateTxStatus.sent,
        { txId: id1, chain: 'c1' },
      );
      const records = await AggregatedStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(records).toHaveLength(3);
      expect(records[0]).toMatchObject(status1);
      expect(records[1]).toMatchObject({
        eventId: id2,
        updatedAt: 20,
        status: AggregateEventStatus.reachedLimit,
        txStatus: AggregateTxStatus.sent,
        tx: { txId: id1, chain: 'c1' },
      });
      expect(records[2]).toMatchObject({
        eventId: id0,
        updatedAt: 10,
        status: AggregateEventStatus.paymentWaiting,
        txStatus: AggregateTxStatus.invalid,
        tx: null,
      });
    });

    /**
     * @target AggregatedStatusRepository.upsertOne should not update database value when status is not changed
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
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
      await TxRepository.insertOne(id1, 'c1', id1, 0, TxType.reward);

      const status0 = mockAggregatedStatusRecords[0];
      const status2 = mockAggregatedStatusRecords[2];

      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt,
        status0.status,
        status0.txStatus,
        status0.tx ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status2.eventId,
        status2.updatedAt,
        status2.status,
        status2.txStatus,
        status2.tx ?? undefined,
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
        status2.txStatus,
        status2.tx ?? undefined,
      );
      await AggregatedStatusRepository.upsertOne(
        status0.eventId,
        status0.updatedAt + 5,
        status0.status,
        status0.txStatus,
        status0.tx ?? undefined,
      );
      const records = await AggregatedStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(repositoryUpsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status0);
      expect(records[1]).toMatchObject(status2);
    });
  });
});
