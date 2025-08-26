import { Repository } from '@rosen-bridge/extended-typeorm';
import { testDataSource } from '@rosen-ui/data-source';
import { GuardStatusChangedEntity, EventStatus } from '@rosen-ui/public-status';

import GuardStatusChangedAction from '@/backend/status/GuardStatusChangedAction';

import { DataSourceMock } from '../../mocked/DataSource.mock';
import {
  mockGuardStatusChangedRecords,
  id0,
  mockPaginationTestData,
} from './testData';

describe('GuardStatusChangedAction', () => {
  beforeAll(() => {
    GuardStatusChangedAction.init();
  });

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
      const lastStatus = await GuardStatusChangedAction.getInstance().getLast(
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
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should call repository.find with DESC ordering on insertedAt field', async () => {
      // act
      const { total, items } =
        await GuardStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(GuardStatusChangedEntity),
          id0,
          ['pk'],
          0,
          100,
        );

      // assert
      expect(total).toBe(0);
      expect(items).toHaveLength(0);
    });

    /**
     * @target GuardStatusChangedAction.getMany should respond with respect to pagination params
     * @dependencies
     * - DataSourceMock
     * - testDataSource
     * @scenario
     * - populate GuardStatusChanged table with 10 records
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
      await DataSourceMock.populateGuardStatusChanged(
        mockPaginationTestData.guardStatusChanged,
      );

      // act
      const { total, items } =
        await GuardStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(GuardStatusChangedEntity),
          id0,
          [],
          0,
          6,
        );

      // assert
      expect(total).toBe(10);
      expect(items).toHaveLength(6);
      expect(items).toEqual(
        mockPaginationTestData.guardStatusChanged.toReversed().slice(0, 6),
      );

      // act
      const { total: total2, items: items2 } =
        await GuardStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(GuardStatusChangedEntity),
          id0,
          [],
          5,
          10,
        );

      // assert
      expect(total2).toBe(10);
      expect(items2).toHaveLength(5);
      expect(items2).toEqual(
        mockPaginationTestData.guardStatusChanged.toReversed().slice(5),
      );
    });
  });

  describe('insertOne', () => {
    /**
     * @target GuardStatusChangedAction.insertOne should call insert when eventId is new
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
      await GuardStatusChangedAction.getInstance().insertOne(
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
     * @target GuardStatusChangedAction.insertOne should call insert when record exists in database and its status is changed
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
      await GuardStatusChangedAction.getInstance().insertOne(
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
     * @target GuardStatusChangedAction.insertOne should throw when record exists in database and its status is not changed
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
        await GuardStatusChangedAction.getInstance().insertOne(
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
