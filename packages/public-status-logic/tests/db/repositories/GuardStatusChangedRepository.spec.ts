import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TxStatus, TxType } from '../../../src/constants';
import { GuardStatusChangedRepository } from '../../../src/db/repositories/GuardStatusChangedRepository';
import { TxRepository } from '../../../src/db/repositories/TxRepository';
import {
  fakeGuardStatusChangedRecords,
  guardPk0,
  guardPk1,
  guardPk2,
  id0,
  id1,
} from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('GuardStatusChangedRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
    // insert a fake tx, required to satisfy relation
    await TxRepository.insertOne(id1, id1, 0, TxType.reward);
  });

  describe('getLast', () => {
    /**
     * @target GuardStatusChangedRepository.getLast should return null if no record is available
     * @dependencies
     * @scenario
     * - call getLast
     * @expected
     * - should have returned null
     */
    it('should return null if no record is available', async () => {
      // act
      const lastStatus = await GuardStatusChangedRepository.getLast(id0, 'pk');

      // assert
      expect(lastStatus).toBeNull();
    });

    /**
     * @target GuardStatusChangedRepository.getLast should return the last GuardStatusChangedEntity record
     * @dependencies
     * @scenario
     * - populate GuardStatusChangedEntity with multiple records
     * - call getLast for multiple id pk pair
     * @expected
     * - should have returned the correct values
     */
    it('should return the last GuardStatusChangedEntity record', async () => {
      // arrange
      await DataSourceMock.populateGuardStatusChanged(
        fakeGuardStatusChangedRecords,
      );

      const status1 = fakeGuardStatusChangedRecords[1];
      const status2 = fakeGuardStatusChangedRecords[2];
      const status3 = fakeGuardStatusChangedRecords[3];

      // act
      const lastStatus0 = await GuardStatusChangedRepository.getLast(
        id0,
        guardPk0,
      );
      const lastStatus1 = await GuardStatusChangedRepository.getLast(
        id1,
        guardPk0,
      );
      const lastStatus2 = await GuardStatusChangedRepository.getLast(
        id0,
        guardPk1,
      );
      const lastStatus3 = await GuardStatusChangedRepository.getLast(
        id0,
        guardPk2,
      );

      // assert
      expect(lastStatus0).toMatchObject(status2);
      expect(lastStatus1).toMatchObject(status1);
      expect(lastStatus2).toMatchObject(status3);
      expect(lastStatus3).toBeNull();
    });
  });

  describe('getMany', () => {
    /**
     * @target GuardStatusChangedRepository.getMany should return empty array if no record is available
     * @dependencies
     * @scenario
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should return empty array if no record is available', async () => {
      // act
      const records0 = await GuardStatusChangedRepository.getMany(id0, []);
      const records1 = await GuardStatusChangedRepository.getMany(id0, ['pk']);

      // assert
      expect(records0).toHaveLength(0);
      expect(records1).toHaveLength(0);
    });

    /**
     * @target GuardStatusChangedRepository.getMany should return array of GuardStatusChangedEntity records
     * @dependencies
     * @scenario
     * - populate GuardStatusChangedEntity
     * - call getMany for multiple id pk pair
     * @expected
     * - should have returned correct values
     */
    it('should return array of GuardStatusChangedEntity records', async () => {
      // arrange
      await DataSourceMock.populateGuardStatusChanged(
        fakeGuardStatusChangedRecords,
      );

      const status0 = fakeGuardStatusChangedRecords[0];
      const status1 = fakeGuardStatusChangedRecords[1];
      const status2 = fakeGuardStatusChangedRecords[2];
      const status3 = fakeGuardStatusChangedRecords[3];

      // act
      const records0 = await GuardStatusChangedRepository.getMany(id0, [
        guardPk0,
      ]);
      const records1 = await GuardStatusChangedRepository.getMany(id1, [
        guardPk0,
      ]);
      const records2 = await GuardStatusChangedRepository.getMany(id0, [
        guardPk1,
      ]);
      const records3 = await GuardStatusChangedRepository.getMany(id0, [
        guardPk0,
        guardPk1,
      ]);

      // assert
      expect(records0).toHaveLength(2);
      expect(records0[0]).toMatchObject(status2);
      expect(records0[1]).toMatchObject(status0);
      expect(records1).toHaveLength(1);
      expect(records1[0]).toMatchObject(status1);
      expect(records2).toHaveLength(1);
      expect(records2[0]).toMatchObject(status3);
      expect(records3).toHaveLength(3);
      expect(records3[0]).toMatchObject(status2);
      expect(records3[1]).toMatchObject(status3);
      expect(records3[2]).toMatchObject(status0);
    });
  });

  describe('insertOne', () => {
    /**
     * @target GuardStatusChangedRepository.insertOne should insert record in database when guard status is changed
     * @dependencies
     * @scenario
     * - spy on GuardStatusChangedRepository.insert
     * - call insertOne
     * - call insertOne again to change the guard's status
     * - get database records
     * @expected
     * - repositoryInsertSpy should have been called with the correct arguments
     * - database should have contained both statuses
     */
    it('should insert record in database when guard status is changed', async () => {
      // arrange
      const status0 = fakeGuardStatusChangedRecords[0];
      const status2 = fakeGuardStatusChangedRecords[2];

      const repositoryInsertSpy = vi.spyOn(
        GuardStatusChangedRepository,
        'insert',
      );

      // act
      await GuardStatusChangedRepository.insertOne(
        status0.eventId,
        status0.guardPk,
        status0.insertedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await GuardStatusChangedRepository.insertOne(
        status2.eventId,
        status2.guardPk,
        status2.insertedAt,
        status2.status,
        status2.tx?.txId,
        status2.txStatus ?? undefined,
      );
      const records = await GuardStatusChangedRepository.createQueryBuilder(
        'record',
      )
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
        ...status2,
        id: 2, // TODO: fix spy issue
        tx: { txId: id1 },
        txStatus: TxStatus.signed,
      });

      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status2);
      expect(records[1]).toMatchObject(status0);
    });

    /**
     * @target GuardStatusChangedRepository.insertOne should not insert record in database when guard status is not changed
     * @dependencies
     * @scenario
     * - call insertOne to populate database with 2 different records
     * - spy on GuardStatusChangedRepository.insert
     * - call insertOne again with the same values
     * - get database records
     * @expected
     * - repositoryInsertSpy should not have been called
     * - database should have contained the initial values
     */
    it('should not insert record in database when guard status is not changed', async () => {
      // arrange
      const status0 = fakeGuardStatusChangedRecords[0];
      const status3 = fakeGuardStatusChangedRecords[3];
      await GuardStatusChangedRepository.insertOne(
        status0.eventId,
        status0.guardPk,
        status0.insertedAt,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      await GuardStatusChangedRepository.insertOne(
        status3.eventId,
        status3.guardPk,
        status3.insertedAt,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );

      const repositoryInsertSpy = vi.spyOn(
        GuardStatusChangedRepository,
        'insert',
      );

      // act
      await GuardStatusChangedRepository.insertOne(
        status3.eventId,
        status3.guardPk,
        status3.insertedAt + 5,
        status3.status,
        status3.tx?.txId,
        status3.txStatus ?? undefined,
      );
      await GuardStatusChangedRepository.insertOne(
        status0.eventId,
        status0.guardPk,
        status0.insertedAt + 5,
        status0.status,
        status0.tx?.txId,
        status0.txStatus ?? undefined,
      );
      const records = await GuardStatusChangedRepository.createQueryBuilder(
        'record',
      )
        .leftJoinAndSelect('record.tx', 'tx')
        .orderBy('record.insertedAt', 'DESC')
        .getMany();

      // assert
      expect(repositoryInsertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(2);
      expect(records[0]).toMatchObject(status3);
      expect(records[1]).toMatchObject(status0);
    });
  });
});
