import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TxType } from '../../../src/constants';
import { GuardStatusRepository } from '../../../src/db/repositories/GuardStatusRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  fakeGuardStatusRecords,
  guardPk0,
  guardPk1,
  guardPk2,
  id0,
  id1,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('GuardStatusRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
    // insert a fake tx, required to satisfy relation
    await TxRepository.insertOne(id1, id1, 0, TxType.reward);
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
      const currentStatus = await GuardStatusRepository.getOne(id0, 'pk');

      // assert
      expect(currentStatus).toBeNull();
    });

    /**
     * @target GuardStatusRepository.getOne should return only the requested GuardStatusEntity record
     * @dependencies
     * @scenario
     * - populate GuardStatusEntity with multiple records
     * - call getOne for multiple id pk pair
     * @expected
     * - should have returned the correct values
     */
    it('should return only the requested GuardStatusEntity record', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus(fakeGuardStatusRecords);

      const status0 = fakeGuardStatusRecords[0];
      const status1 = fakeGuardStatusRecords[1];
      const status2 = fakeGuardStatusRecords[2];

      // act
      const currentStatus0 = await GuardStatusRepository.getOne(id0, guardPk0);
      const currentStatus1 = await GuardStatusRepository.getOne(id1, guardPk0);
      const currentStatus2 = await GuardStatusRepository.getOne(id0, guardPk1);
      const currentStatus3 = await GuardStatusRepository.getOne(id0, guardPk2);

      // assert
      expect(currentStatus0).toMatchObject(status1);
      expect(currentStatus1).toMatchObject(status0);
      expect(currentStatus2).toMatchObject(status2);
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
      const records0 = await GuardStatusRepository.getMany(id0, []);
      const records1 = await GuardStatusRepository.getMany(id0, ['pk']);

      // assert
      expect(records0).toHaveLength(0);
      expect(records1).toHaveLength(0);
    });

    /**
     * @target GuardStatusRepository.getMany should return array of GuardStatus records
     * @dependencies
     * @scenario
     * - populate GuardStatus
     * - call getMany for multiple id pk pair
     * @expected
     * - should have returned correct values
     */
    it('should return array of GuardStatus records', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus(fakeGuardStatusRecords);

      const status0 = fakeGuardStatusRecords[0];
      const status1 = fakeGuardStatusRecords[1];
      const status2 = fakeGuardStatusRecords[2];

      // act
      const records0 = await GuardStatusRepository.getMany(id0, [guardPk0]);
      const records1 = await GuardStatusRepository.getMany(id1, [
        guardPk0,
        guardPk2,
      ]);
      const records2 = await GuardStatusRepository.getMany(id0, [guardPk1]);
      const records3 = await GuardStatusRepository.getMany(id0, [
        guardPk0,
        guardPk1,
      ]);

      // assert
      expect(records0).toHaveLength(1);
      expect(records0[0]).toMatchObject(status1);
      expect(records1).toHaveLength(1);
      expect(records1[0]).toMatchObject(status0);
      expect(records2).toHaveLength(1);
      expect(records2[0]).toMatchObject(status2);
      expect(records3).toHaveLength(2);
      expect(records3[0]).toMatchObject(status1);
      expect(records3[1]).toMatchObject(status2);
    });
  });

  describe('upsertOne', () => {
    /**
     * @target GuardStatusRepository.upsertOne should insert record in database when eventId is new
     * @dependencies
     * @scenario
     * - call upsertOne with 2 different eventIds
     * - get database records
     * @expected
     * - database should have contained 2 records, one for each eventId
     */
    it('should insert record in database when eventId is new', async () => {
      // arrange
      const status0 = fakeGuardStatusRecords[0];
      const status2 = fakeGuardStatusRecords[2];

      // act
      await GuardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await GuardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );
      const records = await GuardStatusRepository.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .orderBy('record.updatedAt', 'DESC')
        .getMany();

      // assert
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status0);
      expect(records[1]).toMatchObject(status2);
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
      const status0 = fakeGuardStatusRecords[0];
      const status2 = fakeGuardStatusRecords[2];

      await GuardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await GuardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );

      const repositoryUpsertSpy = vi.spyOn(GuardStatusRepository, 'upsert');

      // act
      await GuardStatusRepository.upsertOne(
        status2.eventId,
        status2.guardPk,
        status2.updatedAt + 5,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );
      await GuardStatusRepository.upsertOne(
        status0.eventId,
        status0.guardPk,
        status0.updatedAt + 5,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      const records = await GuardStatusRepository.createQueryBuilder('record')
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
