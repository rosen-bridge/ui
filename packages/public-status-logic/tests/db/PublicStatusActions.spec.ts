// should be imported before PublicStatusActions
import * as mocks from '@/tests/db/mocked/DataLayer.mock';

import { PublicStatusActions } from '../../src/db/PublicStatusActions';
import {
  mockExistingGuardStatus,
  mockGuardStatusTx,
  mockAggregatedStatus,
  mockAggregatedStatusOld,
  mockTxDTO,
  mockNewGuardStatus,
  mockNewGuardStatusWithTx,
  mockEventStatusThresholds,
  mockTxStatusThresholds,
} from '../testData';

describe('PublicStatusActions', () => {
  describe('insertStatus', () => {
    beforeEach(() => {
      // reset all mocks for each test
      vi.clearAllMocks();
    });

    /**
     * @target PublicStatusActions.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info not provided
     * @scenario
     * - spy on TxHandler.insertOne
     * - stub GuardStatusHandler.getMany to return an empty array
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - stub AggregatedStatusHandler.upsertOne to return
     * - stub AggregatedStatusChangedHandler.insertOne to return
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should not have been called
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedHandler.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info not provided', async () => {
      // arrange
      const getManySpy = mocks.GuardStatusHandler.getMany.mockResolvedValueOnce(
        [],
      );
      mocks.cloneFilterPushSpy.mockReturnValueOnce([mockNewGuardStatus]);
      mocks.calcAggregatedStatusSpy.mockReturnValue(mockAggregatedStatus);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxHandler.insertOne).not.toHaveBeenCalled();

      expect(getManySpy).toHaveBeenCalledOnce();
      expect(getManySpy).toHaveBeenCalledWith({}, 'eventId0', []);

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.calcAggregatedStatusSpy).toHaveBeenCalledOnce();
      expect(mocks.calcAggregatedStatusSpy).toHaveBeenCalledWith(
        [mockNewGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );
    });

    /**
     * @target PublicStatusActions.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info provided
     * @scenario
     * - stub TxHandler.insertOne to return
     * - stub GuardStatusHandler.getMany to return an empty array
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - stub AggregatedStatusHandler.upsertOne to return
     * - stub AggregatedStatusChangedHandler.insertOne to return
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should have been called once with tx info
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedHandler.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info provided', async () => {
      // arrange
      mocks.TxHandler.insertOne.mockResolvedValueOnce(undefined);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([mockNewGuardStatusWithTx]);
      mocks.calcAggregatedStatusSpy.mockReturnValue(mockAggregatedStatus);
      mocks.GuardStatusHandler.getMany.mockResolvedValueOnce([]);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledWith(
        {},
        'eventId0',
        [],
      );

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.calcAggregatedStatusSpy).toHaveBeenCalledOnce();
      expect(mocks.calcAggregatedStatusSpy).toHaveBeenCalledWith(
        [mockNewGuardStatusWithTx],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );
    });

    /**
     * @target PublicStatusActions.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info not provided
     * @scenario
     * - spy on TxHandler.insertOne
     * - stub GuardStatusHandler.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return true
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - spy on AggregatedStatusHandler.upsertOne
     * - spy on AggregatedStatusChangedHandler.insertOne
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should not have been called
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should not have been called
     * - AggregatedStatusChangedHandler.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusHandler.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatus,
      ]);
      mocks.calcAggregatedStatusSpy
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.aggregatedStatusesMatchSpy.mockReturnValueOnce(true);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxHandler.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledWith(
        {},
        'eventId0',
        [],
      );

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.calcAggregatedStatusSpy.mock.calls.length).toBe(2);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);

      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledOnce();
      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusActions.insertStatus should update guard status and
     * aggregated status when guard statuses exist and aggregated status is
     * changed, tx info not provided
     * @scenario
     * - spy on TxHandler.insertOne
     * - stub GuardStatusHandler.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return false
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - stub AggregatedStatusHandler.upsertOne to return
     * - stub AggregatedStatusChangedHandler.insertOne to return
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should not have been called
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedHandler.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusHandler.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatus,
      ]);
      mocks.calcAggregatedStatusSpy
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.aggregatedStatusesMatchSpy.mockReturnValueOnce(false);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxHandler.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledWith(
        {},
        'eventId0',
        [],
      );

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.calcAggregatedStatusSpy.mock.calls.length).toBe(2);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);

      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledOnce();
      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );
    });

    /**
     * @target PublicStatusActions.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info provided
     * @scenario
     * - stub TxHandler.insertOne to return
     * - stub GuardStatusHandler.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return true
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - spy on AggregatedStatusHandler.upsertOne
     * - spy on AggregatedStatusChangedHandler.insertOne
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should have been called once with tx info
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should not have been called
     * - AggregatedStatusChangedHandler.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info provided', async () => {
      // arrange
      mocks.TxHandler.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusHandler.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatusWithTx,
      ]);
      mocks.calcAggregatedStatusSpy
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.aggregatedStatusesMatchSpy.mockReturnValueOnce(true);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledWith(
        {},
        'eventId0',
        [],
      );

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.calcAggregatedStatusSpy.mock.calls.length).toBe(2);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatusWithTx],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);

      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledOnce();
      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusActions.insertStatus should update guard status and aggregated
     * status when guard statuses exist and aggregated status is changed, tx info provided
     * @scenario
     * - stub TxHandler.insertOne to return
     * - stub GuardStatusHandler.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return false
     * - stub GuardStatusHandler.upsertOne to return
     * - stub GuardStatusChangedHandler.insertOne to return
     * - stub AggregatedStatusHandler.upsertOne to return
     * - stub AggregatedStatusChangedHandler.insertOne to return
     * - call insertStatus
     * @expected
     * - TxHandler.insertOne should have been called once with tx info
     * - GuardStatusHandler.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusHandler.upsertOne should have been called once with guard status info
     * - GuardStatusChangedHandler.insertOne should have been called once with guard status info
     * - AggregatedStatusHandler.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedHandler.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info provided', async () => {
      // arrange
      mocks.TxHandler.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusHandler.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatusWithTx,
      ]);
      mocks.calcAggregatedStatusSpy
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.aggregatedStatusesMatchSpy.mockReturnValueOnce(false);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.getMany).toHaveBeenCalledWith(
        {},
        'eventId0',
        [],
      );

      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledOnce();
      expect(mocks.cloneFilterPushSpy).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.calcAggregatedStatusSpy.mock.calls.length).toBe(2);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatusWithTx],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);
      expect(mocks.calcAggregatedStatusSpy.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
        mockEventStatusThresholds,
        mockTxStatusThresholds,
      ]);

      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledOnce();
      expect(mocks.aggregatedStatusesMatchSpy).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.GuardStatusChangedHandler.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusHandler.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedHandler.insertOne,
      ).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );
    });
  });
});
