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
     * - spy on TxRepository.insertOne
     * - stub GuardStatusRepository.getMany to return an empty array
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should not have been called
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object
     * - Utils.calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedRepository.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([mockNewGuardStatus]);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      // assert
      expect(mocks.TxRepository.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.Utils.calcAggregatedStatus).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.calcAggregatedStatus).toHaveBeenCalledWith([
        mockNewGuardStatus,
      ]);

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledWith(
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
     * - stub TxRepository.insertOne to return
     * - stub GuardStatusRepository.getMany to return an empty array
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should have been called once with tx info
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with empty guards status array, 'guardPk', pk and the new status object with the tx info
     * - Utils.calcAggregatedStatus should have been called once with array containing new status object
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedRepository.insertOne should have been called once with mock aggregated status info
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info provided', async () => {
      // arrange
      mocks.TxRepository.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([
        mockNewGuardStatusWithTx,
      ]);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledWith(
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.Utils.calcAggregatedStatus).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.calcAggregatedStatus).toHaveBeenCalledWith([
        mockNewGuardStatusWithTx,
      ]);

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledWith(
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
     * - spy on TxRepository.insertOne
     * - stub GuardStatusRepository.getMany to return an array with a mock record
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub mocks.Utils.aggregatedStatusesMatch to return true
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - spy on AggregatedStatusRepository.upsertOne
     * - spy on AggregatedStatusChangedRepository.insertOne
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should not have been called
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - Utils.calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - Utils.aggregatedStatusesMatch should have been called once with 2 mock records
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should not have been called
     * - AggregatedStatusChangedRepository.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatus,
      ]);
      mocks.Utils.calcAggregatedStatus
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.Utils.aggregatedStatusesMatch.mockReturnValueOnce(true);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      // assert
      expect(mocks.TxRepository.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.Utils.calcAggregatedStatus.mock.calls.length).toBe(2);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatus],
      ]);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
      ]);

      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusActions.insertStatus should update guard status and
     * aggregated status when guard statuses exist and aggregated status is
     * changed, tx info not provided
     * @scenario
     * - spy on TxRepository.insertOne
     * - stub GuardStatusRepository.getMany to return an array with a mock record
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub mocks.Utils.aggregatedStatusesMatch to return false
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should not have been called
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object
     * - Utils.calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - Utils.aggregatedStatusesMatch should have been called once with 2 mock records
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedRepository.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info not provided', async () => {
      // arrange
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatus,
      ]);
      mocks.Utils.calcAggregatedStatus
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.Utils.aggregatedStatusesMatch.mockReturnValueOnce(false);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      // assert
      expect(mocks.TxRepository.insertOne).not.toHaveBeenCalled();

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatus,
      );

      expect(mocks.Utils.calcAggregatedStatus.mock.calls.length).toBe(2);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatus],
      ]);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
      ]);

      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        undefined,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledWith(
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
     * - stub TxRepository.insertOne to return
     * - stub GuardStatusRepository.getMany to return an array with a mock record
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub mocks.Utils.aggregatedStatusesMatch to return true
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - spy on AggregatedStatusRepository.upsertOne
     * - spy on AggregatedStatusChangedRepository.insertOne
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should have been called once with tx info
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - Utils.calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - Utils.aggregatedStatusesMatch should have been called once with 2 mock records
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should not have been called
     * - AggregatedStatusChangedRepository.insertOne should not have been called
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info provided', async () => {
      // arrange
      mocks.TxRepository.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatusWithTx,
      ]);
      mocks.Utils.calcAggregatedStatus
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.Utils.aggregatedStatusesMatch.mockReturnValueOnce(true);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledWith(
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.Utils.calcAggregatedStatus.mock.calls.length).toBe(2);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatusWithTx],
      ]);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
      ]);

      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).not.toHaveBeenCalled();
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).not.toHaveBeenCalled();
    });

    /**
     * @target PublicStatusActions.insertStatus should update guard status and aggregated
     * status when guard statuses exist and aggregated status is changed, tx info provided
     * @scenario
     * - stub TxRepository.insertOne to return
     * - stub GuardStatusRepository.getMany to return an array with a mock record
     * - stub mocks.Utils.cloneFilterPush to return an array with the new GuardStatusEntity object added to it
     * - stub mocks.Utils.calcAggregatedStatus to return mock aggregated status
     * - stub mocks.Utils.aggregatedStatusesMatch to return false
     * - stub GuardStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - call insertStatus
     * @expected
     * - TxRepository.insertOne should have been called once with tx info
     * - GuardStatusRepository.getMany should have been called once with eventId and []
     * - Utils.cloneFilterPush should have been called once with guards status array, 'guardPk', pk and the new status object with the tx info
     * - Utils.calcAggregatedStatus should have been called twice, first with array containing new status object, then with original guards status array
     * - Utils.aggregatedStatusesMatch should have been called once with 2 mock records
     * - GuardStatusRepository.upsertOne should have been called once with guard status info
     * - GuardStatusChangedRepository.insertOne should have been called once with guard status info
     * - AggregatedStatusRepository.upsertOne should have been called once with mock aggregated status info
     * - AggregatedStatusChangedRepository.insertOne should have been called once with mock aggregated status info
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info provided', async () => {
      // arrange
      mocks.TxRepository.insertOne = vi.fn(() => Promise.resolve());
      mocks.GuardStatusRepository.getMany.mockResolvedValueOnce([
        mockExistingGuardStatus,
      ]);
      mocks.Utils.cloneFilterPush.mockReturnValueOnce([
        mockExistingGuardStatus,
        mockNewGuardStatusWithTx,
      ]);
      mocks.Utils.calcAggregatedStatus
        .mockReturnValueOnce(mockAggregatedStatus) // for new statuses
        .mockReturnValueOnce(mockAggregatedStatusOld); // for original statuses
      mocks.Utils.aggregatedStatusesMatch.mockReturnValueOnce(false);

      // act
      await PublicStatusActions.insertStatus(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockTxDTO,
      );

      // assert
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledTimes(1);
      expect(mocks.TxRepository.insertOne).toHaveBeenCalledWith(
        mockTxDTO.txId,
        mockTxDTO.chain,
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockTxDTO.txType,
      );

      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.getMany).toHaveBeenCalledWith(
        'eventId0',
        [],
      );

      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.cloneFilterPush).toHaveBeenCalledWith(
        [mockExistingGuardStatus],
        'guardPk',
        'guardPk0',
        mockNewGuardStatusWithTx,
      );

      expect(mocks.Utils.calcAggregatedStatus.mock.calls.length).toBe(2);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[0]).toEqual([
        [mockExistingGuardStatus, mockNewGuardStatusWithTx],
      ]);
      expect(mocks.Utils.calcAggregatedStatus.mock.calls[1]).toEqual([
        [mockExistingGuardStatus],
      ]);

      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledTimes(1);
      expect(mocks.Utils.aggregatedStatusesMatch).toHaveBeenCalledWith(
        mockAggregatedStatusOld,
        mockAggregatedStatus,
      );

      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(
        mocks.GuardStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(mocks.GuardStatusChangedRepository.insertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.guardPk,
        mockNewGuardStatusWithTx.updatedAt,
        mockNewGuardStatusWithTx.status,
        mockGuardStatusTx,
      );

      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledTimes(
        1,
      );
      expect(mocks.AggregatedStatusRepository.upsertOne).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );

      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledTimes(1);
      expect(
        mocks.AggregatedStatusChangedRepository.insertOne,
      ).toHaveBeenCalledWith(
        mockNewGuardStatusWithTx.eventId,
        mockNewGuardStatusWithTx.updatedAt,
        mockAggregatedStatus.status,
        mockAggregatedStatus.txStatus,
        mockAggregatedStatus.tx,
      );
    });
  });
});
