import { Repository, In } from 'typeorm';

import { EventStatus } from '../../../src/constants';
import { GuardStatusEntity } from '../../../src/db/entities/GuardStatusEntity';
import GuardStatusHandler from '../../../src/db/handlers/GuardStatusHandler';
import { mockGuardStatusRecords, id0 } from '../../testData';

describe('GuardStatusHandler', () => {
  describe('getOne', () => {
    /**
     * @target GuardStatusHandler.getOne should call repository.findOne using the eventId and guardPk as query
     * @dependencies
     * @scenario
     * - stub repository.findOne to resolve to null
     * - call getOne
     * @expected
     * - should have returned null
     * - findOne should have been called once with eventId and guardPk query
     */
    it('should call repository.findOne using the eventId and guardPk as query', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      // act
      const currentStatus = await GuardStatusHandler.getInstance().getOne(
        repository as unknown as Repository<GuardStatusEntity>,
        id0,
        'pk0',
      );

      // assert
      expect(currentStatus).toBeNull();
      expect(repository.findOne).toHaveBeenCalledOnce();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { eventId: id0, guardPk: 'pk0' },
        relations: ['tx'],
      });
    });
  });

  describe('getMany', () => {
    /**
     * @target GuardStatusHandler.getMany should call repository.find using the eventId and guardPks as query
     * @dependencies
     * @scenario
     * - stub repository.find to resolve to empty array
     * - call getMany
     * @expected
     * - should have returned an empty array
     * - repository.find should have been called once with a query to find records satisfying eventId = id0 and guardPk = pk0 or pk1
     */
    it('should call repository.find using the eventId and guardPks as query', async () => {
      // arrange
      const repository = {
        find: vi.fn().mockResolvedValue([]),
      };

      // act
      const records = await GuardStatusHandler.getInstance().getMany(
        repository as unknown as Repository<GuardStatusEntity>,
        id0,
        ['pk0', 'pk1'],
      );

      // assert
      expect(records).toHaveLength(0);
      expect(repository.find).toHaveBeenCalledOnce();
      expect(repository.find).toHaveBeenCalledWith({
        where: { eventId: id0, guardPk: In(['pk0', 'pk1']) },
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('upsertOne', () => {
    /**
     * @target GuardStatusHandler.upsertOne should call upsert when eventId is new
     * @dependencies
     * @scenario
     * - stub repository.findOne and upsert to resolve to null
     * - call upsertOne with 2 objects containing different eventId guard pk pairs
     * @expected
     * - repository.upsert should have been called twice, once for each eventId guard pk pair
     */
    it('should call upsert when eventId is new', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(null),
      };

      const record = mockGuardStatusRecords[0];
      const record2 = mockGuardStatusRecords[2];

      // act
      await GuardStatusHandler.getInstance().upsertOne(
        repository as unknown as Repository<GuardStatusEntity>,
        record.eventId,
        record.guardPk,
        record.updatedAt,
        record.status,
        record.tx
          ? {
              ...record.tx,
              txStatus: record.txStatus!,
            }
          : undefined,
      );
      await GuardStatusHandler.getInstance().upsertOne(
        repository as unknown as Repository<GuardStatusEntity>,
        record2.eventId,
        record2.guardPk,
        record2.updatedAt,
        record2.status,
        record2.tx
          ? {
              ...record2.tx,
              txStatus: record2.txStatus!,
            }
          : undefined,
      );

      // assert
      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert.mock.calls[0][0][0]).toEqual(record);
      expect(repository.upsert.mock.calls[1][0][0]).toEqual(record2);
    });

    /**
     * @target GuardStatusHandler.upsertOne should call upsert when a record with matching eventId exists and its status is changed
     * @dependencies
     * @scenario
     * - define a mock GuardStatusEntity
     * - stub repository.findOne to resolve to the mock record and upsert to resolve to null
     * - call upsertOne with the updated status
     * @expected
     * - repository.upsert should have been called once with the new status
     */
    it('should call upsert when a record with matching eventId exists and its status is changed', async () => {
      // arrange
      const record = mockGuardStatusRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        upsert: vi.fn().mockResolvedValue(null),
      };

      // act
      await GuardStatusHandler.getInstance().upsertOne(
        repository as unknown as Repository<GuardStatusEntity>,
        record.eventId,
        record.guardPk,
        record.updatedAt + 5,
        EventStatus.completed,
        undefined,
      );

      // assert
      expect(repository.upsert).toHaveBeenCalledOnce();
      expect(repository.upsert).toHaveBeenCalledWith(
        [
          {
            eventId: record.eventId,
            guardPk: record.guardPk,
            updatedAt: record.updatedAt + 5,
            status: EventStatus.completed,
            tx: null,
            txStatus: null,
          },
        ],
        ['eventId', 'guardPk'],
      );
    });

    /**
     * @target GuardStatusHandler.upsertOne should not call upsert when record exists in database and its status is not changed
     * @dependencies
     * @scenario
     * - define a mock GuardStatusEntity
     * - stub repository.findOne to resolve to the mock record and upsert to resolve to null
     * - call upsertOne with the same status
     * @expected
     * - repository.upsert should not have been called
     */
    it('should not call upsert when record exists in database and its status is not changed', async () => {
      // arrange
      const record = mockGuardStatusRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        upsert: vi.fn().mockResolvedValue(null),
      };

      // act
      await GuardStatusHandler.getInstance().upsertOne(
        repository as unknown as Repository<GuardStatusEntity>,
        record.eventId,
        record.guardPk,
        record.updatedAt + 5,
        record.status,
        record.tx
          ? {
              ...record.tx,
              txStatus: record.txStatus!,
            }
          : undefined,
      );

      // assert
      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });
});
