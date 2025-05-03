import { Repository, In } from 'typeorm';

import { EventStatus } from '../../../src/constants';
import { GuardStatusChangedEntity } from '../../../src/db/entities/GuardStatusChangedEntity';
import GuardStatusChangedHandler from '../../../src/db/handlers/GuardStatusChangedHandler';
import { mockGuardStatusChangedRecords, id0 } from '../../testData';

describe('GuardStatusChangedHandler', () => {
  describe('getLast', () => {
    /**
     * @target GuardStatusChangedRepository.getLast should call repository.findOne with DESC ordering on insertedAt field
     * @dependencies
     * @scenario
     * - stub repository.findOne to resolve to null
     * - call getLast
     * @expected
     * - should have returned null
     * - findOne should have been called once with DESC ordering on insertedAt field
     */
    it('should call repository.findOne with DESC ordering on insertedAt field', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      // act
      const lastStatus = await GuardStatusChangedHandler.getInstance().getLast(
        repository as unknown as Repository<GuardStatusChangedEntity>,
        id0,
        'pk',
      );

      // assert
      expect(lastStatus).toBeNull();
      expect(repository.findOne).toHaveBeenCalledOnce();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { eventId: id0, guardPk: 'pk' },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    });
  });

  describe('getMany', () => {
    /**
     * @target GuardStatusChangedRepository.getMany should call repository.find with DESC ordering on insertedAt field
     * @dependencies
     * @scenario
     * - stub repository.find to resolve to empty array
     * - call getMany
     * @expected
     * - should have returned an empty array
     * - find should have been called once with DESC ordering on insertedAt field
     */
    it('should call repository.find with DESC ordering on insertedAt field', async () => {
      // arrange
      const repository = {
        find: vi.fn().mockResolvedValue([]),
      };

      // act
      const records = await GuardStatusChangedHandler.getInstance().getMany(
        repository as unknown as Repository<GuardStatusChangedEntity>,
        id0,
        ['pk'],
      );

      // assert
      expect(records).toHaveLength(0);
      expect(repository.find).toHaveBeenCalledOnce();
      expect(repository.find).toHaveBeenCalledWith({
        where: { eventId: id0, guardPk: In(['pk']) },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    });
  });

  describe('insertOne', () => {
    /**
     * @target GuardStatusChangedHandler.insertOne should call insert when eventId is new
     * @dependencies
     * @scenario
     * - stub repository.findOne and insert to resolve to null
     * - call insertOne
     * @expected
     * - insert should have been called once with the mock record
     */
    it('should call insert when eventId is new', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
        insert: vi.fn().mockResolvedValue(null),
      };

      const record = mockGuardStatusChangedRecords[0];

      // act
      await GuardStatusChangedHandler.getInstance().insertOne(
        repository as unknown as Repository<GuardStatusChangedEntity>,
        record.eventId,
        record.guardPk,
        record.insertedAt,
        record.status,
        record.tx
          ? {
              ...record.tx,
              txStatus: record.txStatus!,
            }
          : undefined,
      );

      // assert
      expect(repository.insert).toHaveBeenCalledOnce();
      expect(repository.insert.mock.calls[0][0]).toEqual(record);
    });

    /**
     * @target GuardStatusChangedHandler.insertOne should call insert when record exists in database and its status is changed
     * @dependencies
     * @scenario
     * - define a mock GuardStatusChangedEntity
     * - stub repository.findOne to resolve to the mock record and insert to resolve to null
     * - call insertOne with a different status
     * @expected
     * - repository.insert should have been called once with the new status
     */
    it('should call insert when record exists in database and its status is changed', async () => {
      // arrange
      const record = mockGuardStatusChangedRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        insert: vi.fn().mockResolvedValue(null),
      };

      // act
      await GuardStatusChangedHandler.getInstance().insertOne(
        repository as unknown as Repository<GuardStatusChangedEntity>,
        record.eventId,
        record.guardPk,
        record.insertedAt,
        EventStatus.paymentWaiting,
        record.tx
          ? {
              ...record.tx,
              txStatus: record.txStatus!,
            }
          : undefined,
      );

      // assert
      expect(repository.insert).toHaveBeenCalledOnce();
      expect(repository.insert.mock.calls[0][0]).toEqual({
        ...record,
        status: EventStatus.paymentWaiting,
      });
    });

    /**
     * @target GuardStatusChangedHandler.insertOne should throw when record exists in database and its status is not changed
     * @dependencies
     * @scenario
     * - define a mock GuardStatusChangedEntity
     * - stub repository.findOne to resolve to the mock record and insert to resolve to null
     * - call insertOne with the mock record
     * @expected
     * - insertOne should have thrown `guard_status_not_changed` error
     * - repository.insert should not have been called
     */
    it('should throw when record exists in database and its status is not changed', async () => {
      // arrange
      const record = mockGuardStatusChangedRecords[1];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        insert: vi.fn().mockResolvedValue(null),
      };

      // act and assert
      await expect(async () => {
        await GuardStatusChangedHandler.getInstance().insertOne(
          repository as unknown as Repository<GuardStatusChangedEntity>,
          record.eventId,
          record.guardPk,
          record.insertedAt + 5,
          record.status,
          record.tx
            ? {
                ...record.tx,
                txStatus: record.txStatus!,
              }
            : undefined,
        );
      }).rejects.toThrowError('guard_status_not_changed');

      expect(repository.insert).not.toHaveBeenCalled();
    });
  });
});
