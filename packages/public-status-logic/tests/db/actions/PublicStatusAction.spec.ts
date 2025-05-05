// should be imported before PublicStatusAction
import * as mocks from '@/tests/db/mocked/DataLayer.mock';

import { PublicStatusAction } from '../../../src/db/actions/PublicStatusAction';
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
} from '../../testData';

describe('PublicStatusAction', () => {
  beforeAll(() => {
    PublicStatusAction.init();
  });

  describe('insertStatus', () => {
    beforeEach(() => {
      // reset all mocks for each test
      vi.clearAllMocks();
    });

    /**
     * @target PublicStatusAction.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info not provided
     * @scenario
     * - spy on TxAction.insertOne
     * - stub GuardStatusAction.getMany to return an empty array
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - stub AggregatedStatusAction.upsertOne to return
     * - stub AggregatedStatusChangedAction.insertOne to return
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should not have been called
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedAction.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info not provided', async () => {
      // arrange
      const getManySpy = mocks.GuardStatusAction.getMany.mockResolvedValueOnce(
        [],
      );
      mocks.cloneFilterPushSpy.mockReturnValueOnce([mockNewGuardStatus]);
      mocks.calcAggregatedStatusSpy.mockReturnValue(mockAggregatedStatus);

      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxAction.insertOne).not.toHaveBeenCalled();

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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
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
     * @target PublicStatusAction.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info provided
     * @scenario
     * - stub TxAction.insertOne to return
     * - stub GuardStatusAction.getMany to return an empty array
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - stub AggregatedStatusAction.upsertOne to return
     * - stub AggregatedStatusChangedAction.insertOne to return
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should have been called once with tx info
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedAction.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info provided', async () => {
      // arrange
      mocks.TxAction.insertOne.mockResolvedValueOnce(undefined);
      mocks.cloneFilterPushSpy.mockReturnValueOnce([mockNewGuardStatusWithTx]);
      mocks.calcAggregatedStatusSpy.mockReturnValue(mockAggregatedStatus);
      mocks.GuardStatusAction.getMany.mockResolvedValueOnce([]);

      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxAction.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxAction.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledWith(
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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
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
     * @target PublicStatusAction.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info not provided
     * @scenario
     * - spy on TxAction.insertOne
     * - stub GuardStatusAction.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return true
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - spy on AggregatedStatusAction.upsertOne
     * - spy on AggregatedStatusChangedAction.insertOne
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should not have been called
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should not have been called
     * - AggregatedStatusChangedAction.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusAction.getMany.mockResolvedValueOnce([
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
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxAction.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledWith(
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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusAction.insertStatus should update guard status and
     * aggregated status when guard statuses exist and aggregated status is
     * changed, tx info not provided
     * @scenario
     * - spy on TxAction.insertOne
     * - stub GuardStatusAction.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return false
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - stub AggregatedStatusAction.upsertOne to return
     * - stub AggregatedStatusChangedAction.insertOne to return
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should not have been called
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedAction.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusAction.getMany.mockResolvedValueOnce([
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
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      // assert
      expect(mocks.TxAction.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledWith(
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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
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
     * @target PublicStatusAction.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info provided
     * @scenario
     * - stub TxAction.insertOne to return
     * - stub GuardStatusAction.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return true
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - spy on AggregatedStatusAction.upsertOne
     * - spy on AggregatedStatusChangedAction.insertOne
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should have been called once with tx info
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should not have been called
     * - AggregatedStatusChangedAction.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info provided', async () => {
      // arrange
      mocks.TxAction.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusAction.getMany.mockResolvedValueOnce([
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
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxAction.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxAction.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledWith(
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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusAction.insertStatus should update guard status and aggregated
     * status when guard statuses exist and aggregated status is changed, tx info provided
     * @scenario
     * - stub TxAction.insertOne to return
     * - stub GuardStatusAction.getMany to return an array with a mock record
     * - stub cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub calcAggregatedStatus to return mock aggregated status
     * - stub aggregatedStatusesMatchSpy to return false
     * - stub GuardStatusAction.upsertOne to return
     * - stub GuardStatusChangedAction.insertOne to return
     * - stub AggregatedStatusAction.upsertOne to return
     * - stub AggregatedStatusChangedAction.insertOne to return
     * - call insertStatus
     * @expected
     * - TxAction.insertOne should have been called once with tx info
     * - GuardStatusAction.getMany should have been called once with eventId and []
     * - cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - aggregatedStatusesMatchSpy should have been called once with 2 mock records
     * - GuardStatusAction.upsertOne should have been called once with guard status info
     * - GuardStatusChangedAction.insertOne should have been called once with guard status info
     * - AggregatedStatusAction.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedAction.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info provided', async () => {
      // arrange
      mocks.TxAction.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusAction.getMany.mockResolvedValueOnce([
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
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxAction.insertOne).toHaveBeenCalledOnce();
      expect(mocks.TxAction.insertOne).toHaveBeenCalledWith(
        {},
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.getMany).toHaveBeenCalledWith(
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

      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.GuardStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedAction.insertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledOnce();
      expect(mocks.AggregatedStatusAction.upsertOne).toHaveBeenCalledWith(
        {},
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
      ).toHaveBeenCalledOnce();
      expect(
        mocks.AggregatedStatusChangedAction.insertOne,
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
