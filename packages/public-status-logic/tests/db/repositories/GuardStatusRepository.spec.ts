import { EventStatus, TxStatus, TxType } from '../../../src/constants';
import {
  mockGuardStatusRecords,
  guardPk0,
  guardPk1,
  guardPk2,
  id0,
  id1,
  txEntityRecord,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

vi.mock('../../../src/db/DataSourceHandler', async () => {
  const { DataSourceMock } = await import('../mocked/DataSource.mock');

  return {
    DataSourceHandler: {
      getInstance: () => ({
        dataSource: DataSourceMock.testDataSource,
      }),
    },
  };
});

describe('GuardStatusRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
  });

  describe('getOne', () => {
    /**
     * @target GuardStatusRepository.getOne should return null if no record is available
     * @dependencies
     * @scenario
     * - call getOne
     * @expected
     * - should have returned null
     */
    it('should return null if no record is available', async () => {
      // act
      const currentStatus = await DataSourceMock.guardStatusRepository.getOne(
        id0,
        'pk',
      );

      // assert
      expect(currentStatus).toBeNull();
    });

    /**
     * @target GuardStatusRepository.getOne should return only the requested GuardStatusEntity record
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate GuardStatusEntity table with multiple records
     * - call getOne for multiple id pk pair
     * @expected
     * - for id0,guardPk0 should have returned the status1 object
     * - for id1,guardPk0 should have returned the status0 object
     * - for id0,guardPk1 should have returned the status2 object
     * - for id0,guardPk2 should have returned null
     */
    it('should return only the requested GuardStatusEntity record', async () => {
      // arrange
      await DataSourceMock.txRepository.insertOne(
        id1,
        'c1',
        id1,
        0,
        TxType.reward,
      );

      await DataSourceMock.populateGuardStatus(mockGuardStatusRecords);

      const status0 = mockGuardStatusRecords[0];
      const status1 = mockGuardStatusRecords[1];
      const status2 = mockGuardStatusRecords[2];

      // act
      const currentStatus0 = await DataSourceMock.guardStatusRepository.getOne(
        id0,
        guardPk0,
      );
      const currentStatus1 = await DataSourceMock.guardStatusRepository.getOne(
        id1,
        guardPk0,
      );
      const currentStatus2 = await DataSourceMock.guardStatusRepository.getOne(
        id0,
        guardPk1,
      );
      const currentStatus3 = await DataSourceMock.guardStatusRepository.getOne(
        id0,
        guardPk2,
      );

      // assert
      expect(currentStatus0).toEqual({ ...status1, tx: txEntityRecord });
      expect(currentStatus1).toEqual(status0);
      expect(currentStatus2).toEqual(status2);
      expect(currentStatus3).toBeNull();
    });
  });

  describe('getMany', () => {
    /**
     * @target GuardStatusRepository.getMany should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records0 = await DataSourceMock.guardStatusRepository.getMany(
        id0,
        [],
      );
      const records1 = await DataSourceMock.guardStatusRepository.getMany(id0, [
        'pk',
      ]);

      // assert
      expect(records0).toHaveLength(0);
      expect(records1).toHaveLength(0);
    });

    /**
     * @target GuardStatusRepository.getMany should return array of GuardStatus records
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate GuardStatusEntity table with multiple records
     * - call getMany for multiple id pk pair
     * @expected
     * - for id0,guardPk0 should have returned 1 record
     * - for id1,guardPks 0,2 should have returned 1 record
     * - for id0,guardPk1 should have returned 1 record
     * - for id0,guardPks 0,1 should have returned 2 records
     */
    it('should return array of GuardStatus records', async () => {
      // arrange
      await DataSourceMock.txRepository.insertOne(
        id1,
        'c1',
        id1,
        0,
        TxType.reward,
      );

      await DataSourceMock.populateGuardStatus(mockGuardStatusRecords);

      const status0 = mockGuardStatusRecords[0];
      const status1 = mockGuardStatusRecords[1];
      const status2 = mockGuardStatusRecords[2];

      // act
      const records0 = await DataSourceMock.guardStatusRepository.getMany(id0, [
        guardPk0,
      ]);
      const records1 = await DataSourceMock.guardStatusRepository.getMany(id1, [
        guardPk0,
        guardPk2,
      ]);
      const records2 = await DataSourceMock.guardStatusRepository.getMany(id0, [
        guardPk1,
      ]);
      const records3 = await DataSourceMock.guardStatusRepository.getMany(id0, [
        guardPk0,
        guardPk1,
      ]);

      // assert
      expect(records0).toHaveLength(1);
      expect(records0[0]).toEqual({ ...status1, tx: txEntityRecord });
      expect(records1).toHaveLength(1);
      expect(records1[0]).toEqual(status0);
      expect(records2).toHaveLength(1);
      expect(records2[0]).toEqual(status2);
      expect(records3).toHaveLength(2);
      expect(records3[0]).toEqual({ ...status1, tx: txEntityRecord });
      expect(records3[1]).toEqual(status2);
    });
  });

  describe('upsertOne', () => {
    /**
     * @target GuardStatusRepository.upsertOne should insert record in database when eventId pk pair is new
     * @dependencies
     * @scenario
     * - call upsertOne with 2 different eventIds
     * - get database records
     * @expected
     * - database should have contained 2 records, one for each eventId pk pair
     */
    it('should insert record in database when eventId pk pair is new', async () => {
      // arrange
      const status0 = mockGuardStatusRecords[0];
      const status2 = mockGuardStatusRecords[2];

      // act
      await DataSourceMock.guardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt,
        status0.status,
        status0.tx
          ? {
              txId: status0.tx.txId,
              chain: status0.tx.chain,
              txStatus: status0.txStatus!,
            }
          : undefined,
      );
      await DataSourceMock.guardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt,
        status2.status,
        status2.tx
          ? {
              txId: status2.tx.txId,
              chain: status2.tx.chain,
              txStatus: status2.txStatus!,
            }
          : undefined,
      );
      const records = await DataSourceMock.guardStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(records).toHaveLength(2);
      expect(records[0]).toEqual(status0);
      expect(records[1]).toEqual(status2);
    });

    /**
     * @target GuardStatusRepository.upsertOne should update record in database when eventId pk pair exists
     * @dependencies
     * @scenario
     * - populate TxEntity table with a record, required to satisfy relation
     * - populate GuardStatusEntity table with 3 records with different eventId pk pairs
     * - call upsertOne with updated values for 2 of the inserted records
     * - get database records
     * @expected
     * - database should have contained 3 records with 2 of them updated
     */
    it('should update record in database when eventId pk pair exists', async () => {
      // arrange
      await DataSourceMock.txRepository.insertOne(
        id1,
        'c1',
        id1,
        0,
        TxType.reward,
      );

      await DataSourceMock.populateGuardStatus(mockGuardStatusRecords);

      const status0 = mockGuardStatusRecords[0];
      const status1 = mockGuardStatusRecords[1];
      const status2 = mockGuardStatusRecords[2];

      // act
      await DataSourceMock.guardStatusRepository.upsertOne(
        status1.eventId,
        status1.guardPk,
        10,
        EventStatus.paymentWaiting,
        undefined,
      );
      await DataSourceMock.guardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        20,
        EventStatus.reachedLimit,
        { txId: id1, chain: 'c1', txStatus: TxStatus.sent },
      );
      const records = await DataSourceMock.guardStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(records).toHaveLength(3);
      expect(records[0]).toEqual(status0);
      expect(records[1]).toEqual({
        eventId: status2.eventId,
        guardPk: status2.guardPk,
        updatedAt: 20,
        status: EventStatus.reachedLimit,
        txStatus: TxStatus.sent,
        tx: txEntityRecord,
      });
      expect(records[2]).toEqual({
        eventId: status1.eventId,
        guardPk: status1.guardPk,
        updatedAt: 10,
        status: EventStatus.paymentWaiting,
        txStatus: null,
        tx: null,
      });
    });

    /**
     * @target GuardStatusRepository.upsertOne should not update database value when guard status is not changed
     * @dependencies
     * @scenario
     * - call upsertOne to populate database with 2 different records
     * - spy on GuardStatusRepository.upsert
     * - call upsertOne again with the same values
     * - get database records
     * @expected
     * - repositoryUpsertSpy should not have been called
     * - database should have contained the initial values
     */
    it('should not update database value when guard status is not changed', async () => {
      // arrange
      const status0 = mockGuardStatusRecords[0];
      const status2 = mockGuardStatusRecords[2];

      await DataSourceMock.guardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt,
        status0.status,
        status0.tx
          ? {
              txId: status0.tx.txId,
              chain: status0.tx.chain,
              txStatus: status0.txStatus!,
            }
          : undefined,
      );
      await DataSourceMock.guardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt,
        status2.status,
        status2.tx
          ? {
              txId: status2.tx.txId,
              chain: status2.tx.chain,
              txStatus: status2.txStatus!,
            }
          : undefined,
      );

      const repositoryUpsertSpy = vi.spyOn(
        DataSourceMock.guardStatusRepository,
        'upsert',
      );

      // act
      await DataSourceMock.guardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt + 5,
        status2.status,
        status2.tx
          ? {
              txId: status2.tx.txId,
              chain: status2.tx.chain,
              txStatus: status2.txStatus!,
            }
          : undefined,
      );
      await DataSourceMock.guardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt + 5,
        status0.status,
        status0.tx
          ? {
              txId: status0.tx.txId,
              chain: status0.tx.chain,
              txStatus: status0.txStatus!,
            }
          : undefined,
      );
      const records = await DataSourceMock.guardStatusRepository.find({
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });

      // assert
      expect(repositoryUpsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toEqual(status0);
      expect(records[1]).toEqual(status2);
    });
  });
});
