/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  TxType,
} from '../../src/constants';
import {
  id0,
  id1,
  fakeGuardStatuses,
  fakeOverallStatuses,
  guardPk0,
  guardPk1,
  fakeTx,
  guardPk2,
  id3,
} from '../testData';
import DatabaseActionMock from './mocked/EventStatusActor.mock';

describe('EventStatusActor', () => {
  const actor = DatabaseActionMock.actor;

  beforeEach(async () => {
    await DatabaseActionMock.clearTables();
  });

  describe('insertOverallStatus', () => {
    /**
     * @target EventStatusActor.insertOverallStatus should insert record in database when no previous record is available
     * @dependencies
     * @scenario
     * - spy on actor.overallStatusChangedRepository.insert
     * - call insertOverallStatus
     * @expected
     * - repositoryInsertSpy should have been called with the correct arguments
     * - record should have been written to database
     */
    it('should insert record in database when no previous record is available', async () => {
      // arrange
      const status0 = fakeOverallStatuses[0];

      const repositoryInsertSpy = vi.spyOn(
        actor.overallStatusChangedRepository,
        'insert',
      );

      // act
      await actor.insertOverallStatus(
        status0.insertedAt,
        status0.eventId,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );

      // assert
      expect(repositoryInsertSpy).toHaveBeenCalledWith({
        ...status0,
        id: 1,
        tx: undefined,
        txStatus: undefined,
      });

      const lastRecord = await actor.overallStatusChangedRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId: id0,
        })
        .getOne();
      expect(lastRecord).toBeDefined();
      expect(lastRecord).toMatchObject(status0);
    });

    /**
     * @target EventStatusActor.insertOverallStatus should not insert record in database when it matches the previous value
     * @dependencies
     * @scenario
     * - insert a tx for overall status relation
     * - call insertOverallStatus (2 records)
     * - spy on actor.overallStatusChangedRepository.insert
     * - call insertOverallStatus again
     * @expected
     * - repositoryInsertSpy should not have been called
     * - only the first records should have been written to database
     */
    it('should not insert record in database when it matches the previous value', async () => {
      // arrange
      await actor.insertTx(id1, id1, 0, TxType.reward);

      await actor.insertOverallStatus(
        0,
        id0,
        AggregateEventStatus.pendingPayment,
        undefined,
        undefined,
      );
      await actor.insertOverallStatus(
        10,
        id1,
        AggregateEventStatus.finished,
        id1,
        AggregateTxStatus.signed,
      );

      const repositoryInsertSpy = vi.spyOn(
        actor.overallStatusChangedRepository,
        'insert',
      );

      // act
      await actor.insertOverallStatus(
        1,
        id0,
        AggregateEventStatus.pendingPayment,
        undefined,
        undefined,
      );
      await actor.insertOverallStatus(
        15,
        id1,
        AggregateEventStatus.finished,
        id1,
        AggregateTxStatus.signed,
      );

      // assert
      expect(repositoryInsertSpy).not.toHaveBeenCalled();

      const records = await actor.overallStatusChangedRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject({
        insertedAt: 10,
        eventId: id1,
        status: AggregateEventStatus.finished,
        tx: { txId: id1 },
        txStatus: AggregateTxStatus.signed,
      });
      expect(records[1]).toMatchObject({
        insertedAt: 0,
        eventId: id0,
        status: AggregateEventStatus.pendingPayment,
        tx: null,
        txStatus: null,
      });
    });
  });

  describe('getLastOverallStatus', () => {
    /**
     * @target EventStatusActor.getLastOverallStatus should return null if no record is available
     * @dependencies
     * @scenario
     * - call getLastOverallStatus
     * @expected
     * - returned value should have been null
     */
    it('should return null if no record is available', async () => {
      // act
      const record = await actor.getLastOverallStatus(id0);

      // assert
      expect(record).toBeNull();
    });

    /**
     * @target EventStatusActor.getLastOverallStatus should return only the last OverallStatusChanged record
     * @dependencies
     * @scenario
     * - populate OverallStatusChanged with multiple records of same eventId
     * - call getLastOverallStatus
     * @expected
     * - returned value should have matched the correct object
     */
    it('should return only the last OverallStatusChanged record', async () => {
      // arrange
      const status1 = fakeOverallStatuses[1];
      await DatabaseActionMock.populateOverallStatusChanged(
        fakeOverallStatuses,
      );

      // act
      const record = await actor.getLastOverallStatus(id0);

      // assert
      expect(record).toBeDefined();
      expect(record).toMatchObject(status1);
    });
  });

  describe('getOverallStatusTimeline', () => {
    /**
     * @target EventStatusActor.getOverallStatusTimeline should return empty array if no record is available for this eventId
     * @dependencies
     * @scenario
     * - call getOverallStatusTimeline
     * @expected
     * - returned array should have been empty
     */
    it('should return empty array if no record is available for this eventId', async () => {
      // act
      const records = await actor.getOverallStatusTimeline(id0);

      // assert
      expect(records).toHaveLength(0);
    });

    /**
     * @target EventStatusActor.getOverallStatusTimeline should return all status changed records by eventId
     * @dependencies
     * @scenario
     * - populate OverallStatusChanged with 3x id0 and 1x id1 and 1x id2
     * - call getOverallStatusTimeline with ids 0,1,3
     * @expected
     * - returned arrays should have matched their correct values
     */
    it('should return all status changed records by eventId', async () => {
      // arrange
      await DatabaseActionMock.populateOverallStatusChanged(
        fakeOverallStatuses,
      );

      // act
      const records0 = await actor.getOverallStatusTimeline(id0);
      const records1 = await actor.getOverallStatusTimeline(id1);
      const records3 = await actor.getOverallStatusTimeline(id3);

      // assert
      expect(records0).toHaveLength(3);
      expect(records0[0]).toMatchObject(fakeOverallStatuses[1]);
      expect(records0[1]).toMatchObject(fakeOverallStatuses[3]);
      expect(records0[2]).toMatchObject(fakeOverallStatuses[0]);

      expect(records1).toHaveLength(1);
      expect(records1[0]).toMatchObject(fakeOverallStatuses[2]);

      expect(records3).toHaveLength(0);
    });
  });

  describe('getLastOverallStatusesByEventIds', () => {
    /**
     * @target EventStatusActor.getLastOverallStatusesByEventIds should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getLastOverallStatusesByEventIds
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records = await actor.getLastOverallStatusesByEventIds([id0, id1]);

      // assert
      expect(records).toHaveLength(0);
    });

    /**
     * @target EventStatusActor.getLastOverallStatusesByEventIds should return last status of each requested eventId
     * @dependencies
     * @scenario
     * - populate OverallStatusChanged
     * - call getLastOverallStatusesByEventIds
     * @expected
     * - should have returned the correct array of statuses
     */
    it('should return last status of each requested eventId', async () => {
      // arrange
      await DatabaseActionMock.populateOverallStatusChanged(
        fakeOverallStatuses,
      );

      // act
      const records = await actor.getLastOverallStatusesByEventIds([id0, id1]);

      // assert
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(fakeOverallStatuses[1]);
      expect(records[1]).toMatchObject(fakeOverallStatuses[2]);
    });
  });

  describe('insertGuardStatus', () => {
    /**
     * @target EventStatusActor.insertGuardStatus should insert record in database only when guard status is changed
     * @dependencies
     * @scenario
     * - call insertGuardStatus
     * - call insertGuardStatus again to change the guard's status
     * @expected
     * - database should have contained the correct guard statuses
     */
    it('should insert record in database only when guard status is changed', async () => {
      // act
      const status0 = fakeGuardStatuses[0];
      const status2 = fakeGuardStatuses[2];
      await actor.insertGuardStatus(
        status0.insertedAt,
        status0.guardPk,
        status0.eventId,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await actor.insertGuardStatus(
        status2.insertedAt,
        status2.guardPk,
        status2.eventId,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );

      // assert
      const records = await actor.guardStatusChangedRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
          eventId: id0,
          guardPk: guardPk0,
        })
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status2);
      expect(records[1]).toMatchObject(status0);
    });

    /**
     * @target EventStatusActor.insertGuardStatus should not insert record in database when guard status is not changed
     * @dependencies
     * @scenario
     * - call insertGuardStatus to populate database with 2 different records
     * - spy on actor.guardStatusChangedRepository.insert
     * - call insertGuardStatus again with the same values
     * @expected
     * - repositoryInsertSpy should not have been called
     * - database should have contained the correct guard statuses
     */
    it('should not insert record in database when guard status is not changed', async () => {
      // arrange
      const status0 = fakeGuardStatuses[0];
      const status3 = fakeGuardStatuses[3];
      await actor.insertGuardStatus(
        status0.insertedAt,
        status0.guardPk,
        status0.eventId,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await actor.insertGuardStatus(
        status3.insertedAt,
        status3.guardPk,
        status3.eventId,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );

      const repositoryInsertSpy = vi.spyOn(
        actor.guardStatusChangedRepository,
        'insert',
      );

      // act
      await actor.insertGuardStatus(
        status3.insertedAt + 5,
        status3.guardPk,
        status3.eventId,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );
      await actor.insertGuardStatus(
        status0.insertedAt + 5,
        status0.guardPk,
        status0.eventId,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );

      // assert
      expect(repositoryInsertSpy).not.toHaveBeenCalled();
      const records = await actor.guardStatusChangedRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId: id0,
        })
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status3);
      expect(records[1]).toMatchObject(status0);
    });
  });

  describe('getLastGuardStatus', () => {
    /**
     * @target EventStatusActor.getLastGuardStatus should return null if no record is available
     * @dependencies
     * @scenario
     * - call getLastGuardStatus
     * @expected
     * - should have returned null
     */
    it('should return null if no record is available', async () => {
      // act
      const lastStatus = await actor.getLastGuardStatus(id0, 'pk');

      // assert
      expect(lastStatus).toBeNull();
    });

    /**
     * @target EventStatusActor.getLastGuardStatus should return only the last GuardStatusChanged record
     * @dependencies
     * @scenario
     * - populate GuardStatusChanged with multiple records
     * - call getLastGuardStatus for multiple id pk pair
     * @expected
     * - should have returned the correct values
     */
    it('should return only the last GuardStatusChanged record', async () => {
      // arrange
      await DatabaseActionMock.populateGuardStatusChanged(fakeGuardStatuses);

      const status1 = fakeGuardStatuses[1];
      const status2 = fakeGuardStatuses[2];
      const status3 = fakeGuardStatuses[3];

      // act
      const lastStatus0 = await actor.getLastGuardStatus(id0, guardPk0);
      const lastStatus1 = await actor.getLastGuardStatus(id1, guardPk0);
      const lastStatus2 = await actor.getLastGuardStatus(id0, guardPk1);
      const lastStatus3 = await actor.getLastGuardStatus(id0, guardPk2);

      // assert
      expect(lastStatus0).toBeDefined();
      expect(lastStatus0).toMatchObject({
        eventId: status2.eventId,
        status: status2.status,
        insertedAt: status2.insertedAt,
      });

      expect(lastStatus1).toBeDefined();
      expect(lastStatus1).toMatchObject({
        eventId: status1.eventId,
        status: status1.status,
        insertedAt: status1.insertedAt,
      });

      expect(lastStatus2).toBeDefined();
      expect(lastStatus2).toMatchObject({
        eventId: status3.eventId,
        status: status3.status,
        insertedAt: status3.insertedAt,
      });

      expect(lastStatus3).toBeNull();
    });
  });

  describe('getGuardStatusTimeline', () => {
    /**
     * @target EventStatusActor.getGuardStatusTimeline should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getGuardStatusTimeline
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records = await actor.getGuardStatusTimeline(id0, ['pk']);

      // assert
      expect(records).toHaveLength(0);
    });

    /**
     * @target EventStatusActor.getGuardStatusTimeline should return array of GuardStatusChanged records
     * @dependencies
     * @scenario
     * - populate GuardStatusChanged
     * - call getGuardStatusTimeline for multiple id pk pair
     * @expected
     * - should have returned correct values
     */
    it('should return array of GuardStatusChanged records', async () => {
      // arrange
      await DatabaseActionMock.populateGuardStatusChanged(fakeGuardStatuses);

      // act
      const records0 = await actor.getGuardStatusTimeline(id0, [guardPk0]);
      const records1 = await actor.getGuardStatusTimeline(id1, [guardPk0]);
      const records2 = await actor.getGuardStatusTimeline(id0, [guardPk1]);
      const records3 = await actor.getGuardStatusTimeline(id0, [
        guardPk0,
        guardPk1,
      ]);

      // assert
      expect(records0).toHaveLength(2);
      expect(records1).toHaveLength(1);
      expect(records2).toHaveLength(1);
      expect(records3).toHaveLength(3);
    });
  });

  describe('getGuardsLastStatus', () => {
    /**
     * @target EventStatusActor.getGuardsLastStatus should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getGuardsLastStatus
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records = await actor.getGuardsLastStatus(id0);

      // assert
      expect(records).toHaveLength(0);
    });

    /**
     * @target EventStatusActor.getGuardsLastStatus should return array of GuardStatusChanged records
     * (each guard's last status)
     * @dependencies
     * @scenario
     * - populate GuardStatusChanged (2 guards for event id 0 and 1 for event id 1)
     * - call getGuardsLastStatus
     * @expected
     * - should have returned correct values
     */
    it('should return array of GuardStatusChanged records', async () => {
      // arrange
      await DatabaseActionMock.populateGuardStatusChanged(fakeGuardStatuses);

      const status1 = fakeGuardStatuses[1];
      const status2 = fakeGuardStatuses[2];
      const status3 = fakeGuardStatuses[3];

      // act
      const records0 = await actor.getGuardsLastStatus(id0);
      const records1 = await actor.getGuardsLastStatus(id1);

      // assert
      expect(records0).toHaveLength(2);
      expect(records0[0]).toMatchObject(status3);
      expect(records0[1]).toMatchObject(status2);

      expect(records1).toHaveLength(1);
      expect(records1[0]).toMatchObject(status1);
    });
  });

  describe('insertTx', () => {
    /**
     * @target EventStatusActor.insertTx should insert record in database when txId is new
     * @dependencies
     * @scenario
     * - spy on actor.txRepository.findOneBy
     * - spy on actor.txRepository.insert
     * - call insertTx
     * @expected
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should have been called with correct arguments
     * - tx should have been inserted into database
     */
    it('should insert record in database when txId is new', async () => {
      // arrange
      const findOneBySpy = vi.spyOn(actor.txRepository, 'findOneBy');
      const insertSpy = vi.spyOn(actor.txRepository, 'insert');
      const tx0 = fakeTx[0];

      // act
      await actor.insertTx(tx0.txId, tx0.eventId, tx0.insertedAt, tx0.txType);

      // assert
      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
      });

      expect(insertSpy).toHaveBeenCalledWith(tx0);

      const records = await actor.txRepository
        .createQueryBuilder('record')
        .getMany();
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject(tx0);
    });

    /**
     * @target EventStatusActor.insertTx should not insert record when tx exists in database
     * @dependencies
     * @scenario
     * - insert a tx
     * - spy on actor.txRepository.findOneBy
     * - spy on actor.txRepository.insert
     * - call insertTx with the same tx
     * @expected
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should not have been called
     * - second tx should not have been inserted into database
     */
    it('should not insert record when tx exists in database', async () => {
      // arrange
      const tx0 = fakeTx[0];
      await actor.insertTx(tx0.txId, tx0.eventId, tx0.insertedAt, tx0.txType);

      const findOneBySpy = vi.spyOn(actor.txRepository, 'findOneBy');
      const insertSpy = vi.spyOn(actor.txRepository, 'insert');

      // act
      await actor.insertTx(
        tx0.txId,
        tx0.eventId,
        tx0.insertedAt + 10,
        tx0.txType,
      );

      // assert
      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
      });

      expect(insertSpy).not.toHaveBeenCalled();

      const records = await actor.txRepository
        .createQueryBuilder('record')
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject(tx0);
    });

    /**
     * @target EventStatusActor.insertTx should throw when findOneBy throws
     * @dependencies
     * @scenario
     * - stub actor.txRepository.findOneBy to reject with an error
     * - spy on actor.txRepository.insert
     * - call insertTx
     * @expected
     * - insertTx should have thrown 'custom_error'
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should not have been called
     * - tx should not have been inserted into database
     */
    it('should throw when findOneBy throws', async () => {
      // arrange
      const tx0 = fakeTx[0];
      const findOneBySpy = vi
        .spyOn(actor.txRepository, 'findOneBy')
        .mockRejectedValue(new Error('custom_error'));
      const insertSpy = vi.spyOn(actor.txRepository, 'insert');

      // act and assert
      await expect(
        async () =>
          await actor.insertTx(
            tx0.txId,
            tx0.eventId,
            tx0.insertedAt,
            tx0.txType,
          ),
      ).rejects.toThrowError('custom_error');

      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
      });

      expect(insertSpy).not.toHaveBeenCalled();

      const records = await actor.txRepository
        .createQueryBuilder('record')
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(0);
    });

    /**
     * @target EventStatusActor.insertTx should throw when insert throws
     * @dependencies
     * @scenario
     * - spy on actor.txRepository.findOneBy
     * - stub actor.txRepository.insert to reject with an error
     * - call insertTx
     * @expected
     * - insertTx should have thrown 'custom_error'
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should have been called with correct arguments
     * - tx should not have been inserted into database
     */
    it('should throw when insert throws', async () => {
      // arrange
      const tx0 = fakeTx[0];
      const findOneBySpy = vi
        .spyOn(actor.txRepository, 'findOneBy')
        .mockResolvedValue(null);
      const insertSpy = vi
        .spyOn(actor.txRepository, 'insert')
        .mockRejectedValue(new Error('custom_error'));

      // act and assert
      await expect(
        async () =>
          await actor.insertTx(
            tx0.txId,
            tx0.eventId,
            tx0.insertedAt,
            tx0.txType,
          ),
      ).rejects.toThrowError('custom_error');

      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
      });

      expect(insertSpy).toHaveBeenCalledWith(tx0);

      const records = await actor.txRepository
        .createQueryBuilder('record')
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
      expect(records).toHaveLength(0);
    });
  });
});
