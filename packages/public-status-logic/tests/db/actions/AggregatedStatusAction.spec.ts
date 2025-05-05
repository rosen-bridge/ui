import { Repository, In } from 'typeorm';

import { AggregateEventStatus } from '../../../src/constants';
import AggregatedStatusAction from '../../../src/db/actions/AggregatedStatusAction';
import { AggregatedStatusEntity } from '../../../src/db/entities/AggregatedStatusEntity';
import { mockAggregatedStatusRecords, id0, id1 } from '../../testData';

describe('AggregatedStatusAction', () => {
  beforeAll(() => {
    AggregatedStatusAction.init();
  });

  describe('getOne', () => {
    /**
     * @target AggregatedStatusAction.getOne should call repository.findOne using the eventId as query
     * @dependencies
     * @scenario
     * - stub repository.findOne to resolve to null
     * - call getOne
     * @expected
     * - should have returned null
     * - findOne should have been called once with eventId query
     */
    it('should call repository.findOne using the eventId as query', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
      };

      // act
      const currentStatus = await AggregatedStatusAction.getInstance().getOne(
        repository as unknown as Repository<AggregatedStatusEntity>,
        id0,
      );

      // assert
      expect(currentStatus).toBeNull();
      expect(repository.findOne).toHaveBeenCalledOnce();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { eventId: id0 },
        relations: ['tx'],
      });
    });
  });

  describe('getMany', () => {
    /**
     * @target AggregatedStatusAction.getMany should call repository.find using the eventIds as query
     * @dependencies
     * @scenario
     * - stub repository.find to resolve to empty array
     * - call getMany
     * @expected
     * - should have returned an empty array
     * - repository.find should have been called once with a query to find records satisfying eventId = id0 or id1
     */
    it('should call repository.find using the eventIds as query', async () => {
      // arrange
      const repository = {
        find: vi.fn().mockResolvedValue([]),
      };

      // act
      const records = await AggregatedStatusAction.getInstance().getMany(
        repository as unknown as Repository<AggregatedStatusEntity>,
        [id0, id1],
      );

      // assert
      expect(records).toHaveLength(0);
      expect(repository.find).toHaveBeenCalledOnce();
      expect(repository.find).toHaveBeenCalledWith({
        where: { eventId: In([id0, id1]) },
        relations: ['tx'],
        order: { eventId: 'ASC' },
      });
    });
  });

  describe('upsertOne', () => {
    /**
     * @target AggregatedStatusAction.upsertOne should call upsert when eventId is new
     * @dependencies
     * @scenario
     * - stub repository.findOne and upsert to resolve to null
     * - call upsertOne with 2 objects containing different eventIds
     * @expected
     * - upsert should have been called twice, once for each eventId
     */
    it('should call upsert when eventId is new', async () => {
      // arrange
      const repository = {
        findOne: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(null),
      };

      const record = mockAggregatedStatusRecords[0];
      const record2 = mockAggregatedStatusRecords[2];

      // act
      await AggregatedStatusAction.getInstance().upsertOne(
        repository as unknown as Repository<AggregatedStatusEntity>,
        record.eventId,
        record.updatedAt,
        record.status,
        record.txStatus,
        record.tx ?? undefined,
      );
      await AggregatedStatusAction.getInstance().upsertOne(
        repository as unknown as Repository<AggregatedStatusEntity>,
        record2.eventId,
        record2.updatedAt,
        record2.status,
        record2.txStatus,
        record2.tx ?? undefined,
      );

      // assert
      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert.mock.calls[0][0][0]).toEqual(record);
      expect(repository.upsert.mock.calls[1][0][0]).toEqual(record2);
    });

    /**
     * @target AggregatedStatusAction.upsertOne should call upsert when a record with matching eventId exists and its status is changed
     * @dependencies
     * @scenario
     * - define a mock AggregatedStatusEntity
     * - stub repository.findOne to resolve to the mock record and upsert to resolve to null
     * - call upsertOne with the updated status
     * @expected
     * - repository.upsert should have been called once with the new status
     */
    it('should call upsert when a record with matching eventId exists and its status is changed', async () => {
      // arrange
      const record = mockAggregatedStatusRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        upsert: vi.fn().mockResolvedValue(null),
      };

      // act
      await AggregatedStatusAction.getInstance().upsertOne(
        repository as unknown as Repository<AggregatedStatusEntity>,
        record.eventId,
        record.updatedAt + 5,
        AggregateEventStatus.pendingPayment,
        record.txStatus,
        undefined,
      );

      // assert
      expect(repository.upsert).toHaveBeenCalledOnce();
      expect(repository.upsert).toHaveBeenCalledWith(
        [
          {
            eventId: record.eventId,
            updatedAt: record.updatedAt + 5,
            status: AggregateEventStatus.pendingPayment,
            txStatus: record.txStatus,
            tx: null,
          },
        ],
        ['eventId'],
      );
    });

    /**
     * @target AggregatedStatusAction.upsertOne should not call upsert when record exists in database and its status is not changed
     * @dependencies
     * @scenario
     * - define a mock AggregatedStatusEntity
     * - stub repository.findOne to resolve to the mock record and upsert to resolve to null
     * - call upsertOne with the same status
     * @expected
     * - repository.upsert should not have been called
     */
    it('should not call upsert when record exists in database and its status is not changed', async () => {
      // arrange
      const record = mockAggregatedStatusRecords[0];

      const repository = {
        findOne: vi.fn().mockResolvedValue(record),
        upsert: vi.fn().mockResolvedValue(null),
      };

      // act
      await AggregatedStatusAction.getInstance().upsertOne(
        repository as unknown as Repository<AggregatedStatusEntity>,
        record.eventId,
        record.updatedAt + 5,
        record.status,
        record.txStatus,
        record.tx ?? undefined,
      );

      // assert
      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });
});
