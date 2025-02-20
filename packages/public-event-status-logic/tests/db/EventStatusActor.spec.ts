/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { beforeEach, describe, expect, it } from 'vitest';

import { AggregateEventStatus, AggregateTxStatus } from '../../src/constants';
import { eventStatusToAggregate, txStatusToAggregate } from '../../src/utils';
import {
  eventId0,
  eventId1,
  fakeInsertGuardStatusRequests,
  fakeInsertStatusRequests,
  guardPk0,
  guardPk1,
} from '../testData';
import DatabaseActionMock from './mocked/EventStatusActor.mock';

// TODO: expect returning object fields

describe('EventStatusActor', () => {
  beforeEach(async () => {
    await DatabaseActionMock.clearTables();
  });

  describe('insertStatus', () => {
    it('should insert record in database when no previous record is available', async () => {
      await DatabaseActionMock.testDatabase.insertStatus(
        fakeInsertStatusRequests[0].timestamp,
        fakeInsertStatusRequests[0].eventId,
        eventStatusToAggregate(fakeInsertStatusRequests[0].status),
        fakeInsertStatusRequests[0].txId,
        fakeInsertStatusRequests[0].txType,
        fakeInsertStatusRequests[0].txStatus &&
          txStatusToAggregate(fakeInsertStatusRequests[0].txStatus),
      );

      const lastRecord =
        await DatabaseActionMock.testDatabase.statusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getOne();

      expect(lastRecord).toBeDefined();
      expect(lastRecord!.insertedAt).toBe(
        fakeInsertStatusRequests[0].timestamp,
      );
      expect(lastRecord!.id).toBe(1);
    });

    it('should not insert record in database when it matches the previous value', async () => {
      await DatabaseActionMock.testDatabase.insertStatus(
        fakeInsertStatusRequests[0].timestamp,
        fakeInsertStatusRequests[0].eventId,
        AggregateEventStatus.pendingPayment,
        fakeInsertStatusRequests[0].txId,
        fakeInsertStatusRequests[0].txType,
        AggregateTxStatus.signed,
      );
      await DatabaseActionMock.testDatabase.insertStatus(
        fakeInsertStatusRequests[0].timestamp,
        fakeInsertStatusRequests[0].eventId,
        AggregateEventStatus.pendingPayment,
        fakeInsertStatusRequests[0].txId,
        fakeInsertStatusRequests[0].txType,
        AggregateTxStatus.signed,
      );
      await DatabaseActionMock.testDatabase.insertStatus(
        fakeInsertStatusRequests[1].timestamp,
        fakeInsertStatusRequests[1].eventId,
        AggregateEventStatus.finished,
        fakeInsertStatusRequests[1].txId,
        fakeInsertStatusRequests[1].txType,
        AggregateTxStatus.signed,
      );
      await DatabaseActionMock.testDatabase.insertStatus(
        fakeInsertStatusRequests[1].timestamp,
        fakeInsertStatusRequests[1].eventId,
        AggregateEventStatus.finished,
        fakeInsertStatusRequests[1].txId,
        fakeInsertStatusRequests[1].txType,
        AggregateTxStatus.signed,
      );

      const records =
        await DatabaseActionMock.testDatabase.statusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(records).toHaveLength(2);
    });
  });

  describe('getLastStatus', () => {
    it('should return null if no record is available', async () => {
      const lastStatus =
        await DatabaseActionMock.testDatabase.getLastStatus(eventId0);
      expect(lastStatus).toBeNull();
    });

    it('should return only the last StatusChanged record', async () => {
      await DatabaseActionMock.insertFakeStatusChangedRecords(
        fakeInsertStatusRequests,
      );

      const lastStatus =
        await DatabaseActionMock.testDatabase.getLastStatus(eventId0);
      expect(lastStatus).toBeDefined();
      expect(lastStatus).toMatchObject({
        eventId: fakeInsertStatusRequests[1].eventId,
        status: eventStatusToAggregate(fakeInsertStatusRequests[1].status),
        txStatus: fakeInsertStatusRequests[1].txStatus,
        insertedAt: fakeInsertStatusRequests[1].timestamp + 2,
      });
    });
  });

  describe('getStatusTimeline', () => {
    it('should return null if no record is available', async () => {
      const lastStatus =
        await DatabaseActionMock.testDatabase.getStatusTimeline(eventId0);
      expect(lastStatus).toHaveLength(0);
    });

    it('should return all status changed records by event Id', async () => {
      await DatabaseActionMock.insertFakeStatusChangedRecords(
        fakeInsertStatusRequests,
      );

      let records =
        await DatabaseActionMock.testDatabase.getStatusTimeline(eventId0);
      expect(records).toHaveLength(4);
      expect(records[0].insertedAt).toBe(1005 + 2);
      expect(records[1].insertedAt).toBe(1001 + 2);
      expect(records[2].insertedAt).toBe(1001 + 2);
      expect(records[3].insertedAt).toBe(1000 + 2);

      records =
        await DatabaseActionMock.testDatabase.getStatusTimeline(eventId1);
      expect(records).toHaveLength(1);
      expect(records[0].insertedAt).toBe(1010 + 2);
    });
  });

  describe('getStatusesById', () => {
    it('should return null if no record is available', async () => {
      const recordsDict = await DatabaseActionMock.testDatabase.getStatusesById(
        [eventId0, eventId1],
      );
      expect(Object.keys(recordsDict)).toHaveLength(0);
    });

    it('should return last status of each requested eventId', async () => {
      await DatabaseActionMock.insertFakeStatusChangedRecords(
        fakeInsertStatusRequests,
      );

      const records = await DatabaseActionMock.testDatabase.getStatusesById([
        eventId0,
        eventId1,
      ]);

      expect(records).toHaveLength(2);
      expect(records[0].eventId).toBe(eventId0);
      expect(records[0].insertedAt).toBe(1005 + 2);
      expect(records[1].eventId).toBe(eventId1);
      expect(records[1].insertedAt).toBe(1010 + 2);
    });
  });

  describe('insertGuardStatus', () => {
    it('should insert record in database when no previous record is available', async () => {
      await DatabaseActionMock.testDatabase.insertGuardStatus(
        fakeInsertGuardStatusRequests[0].timestamp,
        fakeInsertGuardStatusRequests[0].guardPk,
        fakeInsertGuardStatusRequests[0].eventId,
        fakeInsertGuardStatusRequests[0].status,
        fakeInsertGuardStatusRequests[0].txId,
        fakeInsertGuardStatusRequests[0].txType,
        fakeInsertGuardStatusRequests[0].txStatus,
      );

      const lastRecord =
        await DatabaseActionMock.testDatabase.guardStatusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
            eventId: eventId0,
            guardPk: guardPk0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getOne();

      expect(lastRecord).toBeDefined();
      expect(lastRecord!.insertedAt).toBe(
        fakeInsertGuardStatusRequests[0].timestamp,
      );
      expect(lastRecord!.id).toBe(1);
    });

    it('should not insert record in database when it matches the previous value', async () => {
      await DatabaseActionMock.testDatabase.insertGuardStatus(
        fakeInsertGuardStatusRequests[0].timestamp,
        fakeInsertGuardStatusRequests[0].guardPk,
        fakeInsertGuardStatusRequests[0].eventId,
        fakeInsertGuardStatusRequests[0].status,
        fakeInsertGuardStatusRequests[0].txId,
        fakeInsertGuardStatusRequests[0].txType,
        fakeInsertGuardStatusRequests[0].txStatus,
      );
      await DatabaseActionMock.testDatabase.insertGuardStatus(
        fakeInsertGuardStatusRequests[0].timestamp,
        fakeInsertGuardStatusRequests[0].guardPk,
        fakeInsertGuardStatusRequests[0].eventId,
        fakeInsertGuardStatusRequests[0].status,
        fakeInsertGuardStatusRequests[0].txId,
        fakeInsertGuardStatusRequests[0].txType,
        fakeInsertGuardStatusRequests[0].txStatus,
      );
      await DatabaseActionMock.testDatabase.insertGuardStatus(
        fakeInsertGuardStatusRequests[3].timestamp,
        fakeInsertGuardStatusRequests[3].guardPk,
        fakeInsertGuardStatusRequests[3].eventId,
        fakeInsertGuardStatusRequests[3].status,
        fakeInsertGuardStatusRequests[3].txId,
        fakeInsertGuardStatusRequests[3].txType,
        fakeInsertGuardStatusRequests[3].txStatus,
      );
      await DatabaseActionMock.testDatabase.insertGuardStatus(
        fakeInsertGuardStatusRequests[3].timestamp,
        fakeInsertGuardStatusRequests[3].guardPk,
        fakeInsertGuardStatusRequests[3].eventId,
        fakeInsertGuardStatusRequests[3].status,
        fakeInsertGuardStatusRequests[3].txId,
        fakeInsertGuardStatusRequests[3].txType,
        fakeInsertGuardStatusRequests[3].txStatus,
      );

      const records =
        await DatabaseActionMock.testDatabase.guardStatusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
            eventId: eventId0,
            guardPk: guardPk0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(records).toHaveLength(2);
    });
  });

  describe('getLastGuardStatus', () => {
    it('should return null if no record is available', async () => {
      const lastStatus =
        await DatabaseActionMock.testDatabase.getLastGuardStatus(
          eventId0,
          'pk',
        );
      expect(lastStatus).toBeNull();
    });

    it('should return only the last GuardStatusChanged record', async () => {
      await DatabaseActionMock.insertFakeGuardStatusChangedRecords(
        fakeInsertGuardStatusRequests,
      );

      let lastStatus = await DatabaseActionMock.testDatabase.getLastGuardStatus(
        eventId0,
        guardPk0,
      );
      expect(lastStatus).toBeDefined();
      expect(lastStatus).toMatchObject({
        eventId: fakeInsertGuardStatusRequests[2].eventId,
        status: fakeInsertGuardStatusRequests[2].status,
        insertedAt: fakeInsertGuardStatusRequests[2].timestamp + 2,
      });

      lastStatus = await DatabaseActionMock.testDatabase.getLastGuardStatus(
        eventId1,
        fakeInsertGuardStatusRequests[1].guardPk,
      );
      expect(lastStatus).toBeDefined();
      expect(lastStatus).toMatchObject({
        eventId: eventId1,
        status: fakeInsertGuardStatusRequests[1].status,
        insertedAt: fakeInsertGuardStatusRequests[1].timestamp + 2,
      });

      lastStatus = await DatabaseActionMock.testDatabase.getLastGuardStatus(
        eventId0,
        guardPk1,
      );
      expect(lastStatus).toBeDefined();
      expect(lastStatus).toMatchObject({
        eventId: eventId0,
        status: fakeInsertGuardStatusRequests[3].status,
        insertedAt: fakeInsertGuardStatusRequests[3].timestamp + 2,
      });
    });
  });

  describe('getGuardStatusTimeline', () => {
    it('should return null if no record is available', async () => {
      const lastStatus =
        await DatabaseActionMock.testDatabase.getGuardStatusTimeline(eventId0, [
          'pk',
        ]);
      expect(lastStatus).toHaveLength(0);
    });

    it('should return array of GuardStatusChanged records', async () => {
      await DatabaseActionMock.insertFakeGuardStatusChangedRecords(
        fakeInsertGuardStatusRequests,
      );

      let records =
        await DatabaseActionMock.testDatabase.getGuardStatusTimeline(eventId0, [
          guardPk0,
        ]);
      expect(records).toHaveLength(2);

      records = await DatabaseActionMock.testDatabase.getGuardStatusTimeline(
        eventId1,
        [fakeInsertGuardStatusRequests[1].guardPk],
      );
      expect(records).toHaveLength(1);

      records = await DatabaseActionMock.testDatabase.getGuardStatusTimeline(
        eventId0,
        [guardPk1],
      );
      expect(records).toHaveLength(1);

      records = await DatabaseActionMock.testDatabase.getGuardStatusTimeline(
        eventId0,
        [guardPk0, guardPk1],
      );
      expect(records).toHaveLength(3);
    });
  });

  describe('getGuardsLastStatus', () => {
    it('should return null if no record is available', async () => {
      const lastStatus =
        await DatabaseActionMock.testDatabase.getGuardsLastStatus(eventId0);
      expect(lastStatus).toHaveLength(0);
    });

    it('should return array of GuardStatusChanged records', async () => {
      const statuses = fakeInsertGuardStatusRequests;

      await DatabaseActionMock.insertFakeGuardStatusChangedRecords(statuses);

      let records =
        await DatabaseActionMock.testDatabase.getGuardsLastStatus(eventId0);
      expect(records).toHaveLength(2);
      expect(records[0].insertedAt).toBe(statuses[3].timestamp + 2);
      expect(records[0].status).toBe(statuses[3].status);
      expect(records[1].insertedAt).toBe(statuses[2].timestamp + 2);
      expect(records[1].status).toBe(statuses[2].status);

      records =
        await DatabaseActionMock.testDatabase.getGuardsLastStatus(eventId1);
      expect(records).toHaveLength(1);
      expect(records[0].insertedAt).toBe(statuses[1].timestamp + 2);
      expect(records[0].status).toBe(statuses[1].status);
    });
  });
});
