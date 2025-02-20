/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { beforeEach, describe, expect, it } from 'vitest';

import * as EventStatusActions from '../../src/db/EventStatusActions';
import {
  eventId0,
  fakeInsertGuardStatusRequests,
  fakeInsertStatusRequests,
  guardPk0,
  guardPk1,
  guardPk2,
  majorityInsertStatusRequests,
} from '../testData';
import DatabaseActionMock from './mocked/EventStatusActor.mock';

describe('EventStatusActions', () => {
  beforeEach(async () => {
    await DatabaseActionMock.clearTables();
  });

  describe('insertStatus', () => {
    it('should insert record in database when no previous record is available', async () => {
      await EventStatusActions.insertStatus(
        fakeInsertStatusRequests[0].timestamp,
        fakeInsertStatusRequests[0].guardPk,
        fakeInsertStatusRequests[0].eventId,
        fakeInsertStatusRequests[0].status,
        fakeInsertStatusRequests[0].txId,
        fakeInsertStatusRequests[0].txType,
        fakeInsertStatusRequests[0].txStatus,
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

      //

      const lastGuardRecord =
        await DatabaseActionMock.testDatabase.guardStatusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
            eventId: eventId0,
            guardPk: guardPk0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getOne();

      expect(lastGuardRecord).toBeDefined();
      expect(lastGuardRecord!.insertedAt).toBe(
        fakeInsertGuardStatusRequests[0].timestamp,
      );
      expect(lastGuardRecord!.id).toBe(1);
    });

    it('should only create StatusChangedEntity when aggregated status changes', async () => {
      for (const req of majorityInsertStatusRequests) {
        await EventStatusActions.insertStatus(
          req.timestamp,
          req.guardPk,
          req.eventId,
          req.status,
          req.txId,
          req.txType,
          req.txStatus,
        );
      }

      const records =
        await DatabaseActionMock.testDatabase.statusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(records).toHaveLength(2);

      const guardRecords =
        await DatabaseActionMock.testDatabase.guardStatusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(guardRecords).toHaveLength(4);

      //

      await EventStatusActions.insertStatus(
        majorityInsertStatusRequests[3].timestamp,
        guardPk1,
        majorityInsertStatusRequests[3].eventId,
        majorityInsertStatusRequests[3].status,
        majorityInsertStatusRequests[3].txId,
        majorityInsertStatusRequests[3].txType,
        majorityInsertStatusRequests[3].txStatus,
      );
      await EventStatusActions.insertStatus(
        majorityInsertStatusRequests[3].timestamp,
        guardPk2,
        majorityInsertStatusRequests[3].eventId,
        majorityInsertStatusRequests[3].status,
        majorityInsertStatusRequests[3].txId,
        majorityInsertStatusRequests[3].txType,
        majorityInsertStatusRequests[3].txStatus,
      );

      const records2 =
        await DatabaseActionMock.testDatabase.statusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(records2).toHaveLength(2);

      const guardRecords2 =
        await DatabaseActionMock.testDatabase.guardStatusChangedRepository
          .createQueryBuilder('record')
          .where('record.eventId = :eventId', {
            eventId: eventId0,
          })
          .orderBy('record.insertedAt', 'DESC')
          .getMany();

      expect(guardRecords2).toHaveLength(4);
    });
  });
});
