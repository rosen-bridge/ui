import { Repository } from '@rosen-bridge/extended-typeorm';
import { testDataSource } from '@rosen-ui/data-source';
import { GuardStatusEntity, EventStatus } from '@rosen-ui/public-status';

import GuardStatusAction from '@/backend/status/GuardStatusAction';

import { DataSourceMock } from '../../mocked/DataSource.mock';
import {
  mockGuardStatusRecords,
  id0,
  mockPaginationTestData,
} from './testData';

describe('GuardStatusAction', () => {
  beforeAll(() => {
    GuardStatusAction.init();
  });

  describe('getOne', () => {
    /**
     * @target GuardStatusAction.getOne should call repository.findOne using the eventId and guardPk as query
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
      const currentStatus = await GuardStatusAction.getInstance().getOne(
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
     * @target GuardStatusAction.getMany should call repository.find using the eventId and guardPks as query
     * @dependencies
     * @scenario
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should call repository.find using the eventId and guardPks as query', async () => {
      // act
      const { total, items } = await GuardStatusAction.getInstance().getMany(
        testDataSource.getRepository(GuardStatusEntity),
        id0,
        ['pk0', 'pk1'],
        0,
        100,
      );

      // assert
      expect(total).toBe(0);
      expect(items).toHaveLength(0);
    });

    /**
     * @target GuardStatusAction.getMany should respond with respect to pagination params
     * @dependencies
     * - DataSourceMock
     * - testDataSource
     * @scenario
     * - populate GuardStatus table with 10 records
     * - call getMany with offset = 0 and limit = 6
     * - check the returned value
     * - call getMany with offset = 5 and limit = 10
     * - check the returned value
     * @expected
     * - first getMany call should return the first 6 mock records
     * - second getMany call should return the last 5 mock records
     */
    it('should respond with respect to pagination params', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus(
        mockPaginationTestData.guardStatus,
      );

      // act
      const { total, items } = await GuardStatusAction.getInstance().getMany(
        testDataSource.getRepository(GuardStatusEntity),
        id0,
        [],
        0,
        6,
      );

      // assert
      expect(total).toBe(10);
      expect(items).toHaveLength(6);
      expect(items).toEqual(
        mockPaginationTestData.guardStatus.toReversed().slice(0, 6),
      );

      // act
      const { total: total2, items: items2 } =
        await GuardStatusAction.getInstance().getMany(
          testDataSource.getRepository(GuardStatusEntity),
          id0,
          [],
          5,
          10,
        );

      // assert
      expect(total2).toBe(10);
      expect(items2).toHaveLength(5);
      expect(items2).toEqual(
        mockPaginationTestData.guardStatus.toReversed().slice(5),
      );
    });
  });

  describe('upsertOne', () => {
    /**
     * @target GuardStatusAction.upsertOne should call upsert when eventId is new
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
      await GuardStatusAction.getInstance().upsertOne(
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
      await GuardStatusAction.getInstance().upsertOne(
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
     * @target GuardStatusAction.upsertOne should call upsert when a record with matching eventId exists and its status is changed
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
      await GuardStatusAction.getInstance().upsertOne(
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
     * @target GuardStatusAction.upsertOne should not call upsert when record exists in database and its status is not changed
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
      await GuardStatusAction.getInstance().upsertOne(
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
