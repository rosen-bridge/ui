import { Repository } from '@rosen-bridge/extended-typeorm';
import { testDataSource } from '@rosen-ui/data-source';
import {
  AggregatedStatusChangedEntity,
  AggregateEventStatus,
} from '@rosen-ui/public-status';

import AggregatedStatusChangedAction from '@/backend/status/AggregatedStatusChangedAction';

import { DataSourceMock } from '../../mocked/DataSource.mock';
import {
  mockAggregatedStatusChangedRecords,
  id0,
  mockPaginationTestData,
} from './testData';

describe('AggregatedStatusChangedAction', () => {
  beforeAll(() => {
    AggregatedStatusChangedAction.init();
  });

  describe('getLast', () => {
    /**
     * @target AggregatedStatusChangedAction.getLast should call repository.findOne with DESC ordering on insertedAt field
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
      const lastStatus =
        await AggregatedStatusChangedAction.getInstance().getLast(
          repository as unknown as Repository<AggregatedStatusChangedEntity>,
          id0,
        );

      // assert
      expect(lastStatus).toBeNull();
      expect(repository.findOne).toHaveBeenCalledOnce();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { eventId: id0 },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    });
  });

  describe('getMany', () => {
    /**
     * @target AggregatedStatusChangedAction.getMany should call repository.find with DESC ordering on insertedAt field
     * @dependencies
     * @scenario
     * - call getMany
     * @expected
     * - should have returned an empty array
     */
    it('should call repository.find with DESC ordering on insertedAt field', async () => {
      // act
      const { total, items } =
        await AggregatedStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(AggregatedStatusChangedEntity),
          id0,
          0,
          100,
        );

      // assert
      expect(total).toBe(0);
      expect(items).toHaveLength(0);
    });

    /**
     * @target AggregatedStatusChangedAction.getMany should respond with respect to pagination params
     * @dependencies
     * - DataSourceMock
     * - testDataSource
     * @scenario
     * - populate AggregatedStatusChanged table with 10 records
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
      await DataSourceMock.populateAggregatedStatusChanged(
        mockPaginationTestData.aggregatedStatusChanged,
      );

      // act
      const { total, items } =
        await AggregatedStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(AggregatedStatusChangedEntity),
          id0,
          0,
          6,
        );

      // assert
      expect(total).toBe(10);
      expect(items).toHaveLength(6);
      expect(items).toEqual(
        mockPaginationTestData.aggregatedStatusChanged.toReversed().slice(0, 6),
      );

      // act
      const { total: total2, items: items2 } =
        await AggregatedStatusChangedAction.getInstance().getMany(
          testDataSource.getRepository(AggregatedStatusChangedEntity),
          id0,
          5,
          10,
        );

      // assert
      expect(total2).toBe(10);
      expect(items2).toHaveLength(5);
      expect(items2).toEqual(
        mockPaginationTestData.aggregatedStatusChanged.toReversed().slice(5),
      );
    });
  });

  describe('insertOne', () => {
    /**
     * @target AggregatedStatusChangedAction.insertOne should call insert when eventId is new
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

      const record = mockAggregatedStatusChangedRecords[0];

      // act
      await AggregatedStatusChangedAction.getInstance().insertOne(
        repository as unknown as Repository<AggregatedStatusChangedEntity>,
        record.eventId,
        record.insertedAt,
        record.status,
        record.txStatus ?? undefined,
        record.tx ?? undefined,
      );

      // assert
      expect(repository.insert).toHaveBeenCalledOnce();
      expect(repository.insert.mock.calls[0][0]).toEqual(record);
    });

    /**
     * @target AggregatedStatusChangedAction.insertOne should call insert when record exists in database and its status is changed
     * @dependencies
     * @scenario
     * - define a mock AggregatedStatusChangedEntity
     * - stub repository.findOne to resolve to the mock record and insert to resolve to null
     * - call insertOne with a different status
     * @expected
     * - repository.insert should have been called once with the new status
     */
    it('should call insert when record exists in database and its status is changed', async () => {
      // arrange
      const record = mockAggregatedStatusChangedRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        insert: vi.fn().mockResolvedValue(null),
      };

      // act
      await AggregatedStatusChangedAction.getInstance().insertOne(
        repository as unknown as Repository<AggregatedStatusChangedEntity>,
        record.eventId,
        record.insertedAt,
        AggregateEventStatus.paymentWaiting,
        record.txStatus ?? undefined,
        record.tx ?? undefined,
      );

      // assert
      expect(repository.insert).toHaveBeenCalledOnce();
      expect(repository.insert.mock.calls[0][0]).toEqual({
        ...record,
        status: AggregateEventStatus.paymentWaiting,
      });
    });

    /**
     * @target AggregatedStatusChangedAction.insertOne should throw when record exists in database and its status is not changed
     * @dependencies
     * @scenario
     * - define a mock AggregatedStatusChangedEntity
     * - stub repository.findOne to resolve to the mock record and insert to resolve to null
     * - call insertOne with the mock record
     * @expected
     * - insertOne should have thrown `aggregated_status_not_changed` error
     * - repository.insert should not have been called
     */
    it('should throw when record exists in database and its status is not changed', async () => {
      // arrange
      const record = mockAggregatedStatusChangedRecords[1];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        insert: vi.fn().mockResolvedValue(null),
      };

      // act and assert
      await expect(async () => {
        await AggregatedStatusChangedAction.getInstance().insertOne(
          repository as unknown as Repository<AggregatedStatusChangedEntity>,
          record.eventId,
          record.insertedAt + 5,
          record.status,
          record.txStatus ?? undefined,
          record.tx ?? undefined,
        );
      }).rejects.toThrowError('aggregated_status_not_changed');

      expect(repository.insert).not.toHaveBeenCalled();
    });
  });
});
