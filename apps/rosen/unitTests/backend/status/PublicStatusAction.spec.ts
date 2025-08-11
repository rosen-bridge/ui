import { testDataSource } from '@rosen-ui/data-source';
import { AggregateEventStatus } from '@rosen-ui/public-status';

import { PublicStatusAction } from '@/backend/status/PublicStatusAction';

import { DataSourceMock } from '../../mocked/DataSource.mock';
import {
  mockExistingGuardStatus,
  mockTxDTO,
  mockNewGuardStatus,
  mockEventStatusThresholds,
  mockTxStatusThresholds,
  mockNewGuardStatusChanged,
  mockNewAggregatedStatusChanged,
  mockNewAggregatedStatus,
  mockExistingAggregatedStatusChanged,
  mockExistingAggregatedStatus,
  mockNewTx,
  mockExistingGuardStatusChanged,
  mockGuardStatusTx,
  mockNewGuardStatusAggregateChange,
  mockNewGuardStatusChangedAggregateChange,
} from './PublicStatusAction.testData';

describe('PublicStatusAction', () => {
  beforeAll(() => {
    PublicStatusAction.init(testDataSource);
  });

  describe('insertStatus', () => {
    beforeEach(async () => {
      // reset all mocks for each test
      vi.clearAllMocks();
      await DataSourceMock.clearTables();
    });

    /**
     * @target PublicStatusAction.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info not provided
     * @scenario
     * - call insertStatus
     * - get all records of GuardStatusChanged, GuardStatus, AggregatedStatusChanged, AggregatedStatus, Tx from database
     * @expected
     * - database should have contained a GuardStatus record
     * - database should have contained a GuardStatusChanged record
     * - database should have contained a AggregatedStatus record
     * - database should have contained a AggregatedStatusChanged record
     * - database should have contained no Tx records
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info not provided', async () => {
      // arrange
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

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(1);
      expect(guardStatusRecords[0]).toEqual(mockNewGuardStatus);
      expect(guardStatusChangedRecords).toHaveLength(1);
      expect(guardStatusChangedRecords[0]).toEqual(mockNewGuardStatusChanged);
      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual({
        ...mockNewAggregatedStatus,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(aggregatedStatusChangedRecords).toHaveLength(1);
      expect(aggregatedStatusChangedRecords[0]).toEqual({
        ...mockNewAggregatedStatusChanged,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(txRecords).toHaveLength(0);
    });

    /**
     * @target PublicStatusAction.insertStatus should update aggregated status and
     * guard status when no guard statuses exist for this eventId, tx info provided
     * @scenario
     * - call insertStatus
     * @expected
     * - database should have contained a GuardStatus record
     * - database should have contained a GuardStatusChanged record
     * - database should have contained a AggregatedStatus record
     * - database should have contained a AggregatedStatusChanged record
     * - database should have contained a Tx record
     */
    it('should update aggregated status and guard status when no guard statuses exist for this eventId, tx info provided', async () => {
      // arrange
      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(1);
      expect(guardStatusRecords[0]).toEqual({
        ...mockNewGuardStatus,
        ...mockGuardStatusTx,
      });
      expect(guardStatusChangedRecords).toHaveLength(1);
      expect(guardStatusChangedRecords[0]).toEqual({
        ...mockNewGuardStatusChanged,
        ...mockGuardStatusTx,
      });
      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual({
        ...mockNewAggregatedStatus,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(aggregatedStatusChangedRecords).toHaveLength(1);
      expect(aggregatedStatusChangedRecords[0]).toEqual({
        ...mockNewAggregatedStatusChanged,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(txRecords).toHaveLength(1);
      expect(txRecords[0]).toEqual(mockNewTx);
    });

    /**
     * @target PublicStatusAction.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info not provided
     * @scenario
     * - populate GuardStatus table with a mock record
     * - populate GuardStatusChanged table with a mock record
     * - populate AggregatedStatus table with a mock record
     * - populate AggregatedStatusChanged table with a mock record
     * - call insertStatus
     * @expected
     * - database should have contained 2 GuardStatus records
     * - database should have contained 2 GuardStatusChanged records
     * - database should have contained a AggregatedStatus record
     * - database should have contained a AggregatedStatusChanged record
     * - database should have contained no Tx records
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info not provided', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus([mockExistingGuardStatus]);
      await DataSourceMock.populateGuardStatusChanged([
        mockExistingGuardStatusChanged,
      ]);
      await DataSourceMock.populateAggregatedStatus([
        mockExistingAggregatedStatus,
      ]);
      await DataSourceMock.populateAggregatedStatusChanged([
        mockExistingAggregatedStatusChanged,
      ]);

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

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(2);
      expect(guardStatusRecords[1]).toEqual(mockNewGuardStatus);
      expect(guardStatusRecords[0]).toEqual(mockExistingGuardStatus);
      expect(guardStatusChangedRecords).toHaveLength(2);
      expect(guardStatusChangedRecords[1]).toEqual(mockNewGuardStatusChanged);
      expect(guardStatusChangedRecords[0]).toEqual(
        mockExistingGuardStatusChanged,
      );
      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual({
        ...mockExistingAggregatedStatus,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(aggregatedStatusChangedRecords).toHaveLength(1);
      expect(aggregatedStatusChangedRecords[0]).toEqual({
        ...mockExistingAggregatedStatusChanged,
        status: AggregateEventStatus.waitingForConfirmation,
      });
      expect(txRecords).toHaveLength(0);
    });

    /**
     * @target PublicStatusAction.insertStatus should update guard status and
     * aggregated status when guard statuses exist and aggregated status is
     * changed, tx info not provided
     * @scenario
     * - populate GuardStatus table with a mock record
     * - populate GuardStatusChanged table with a mock record
     * - populate AggregatedStatus table with a mock record
     * - populate AggregatedStatusChanged table with a mock record
     * - call insertStatus
     * @expected
     * - database should have contained 2 GuardStatus records
     * - database should have contained 2 GuardStatusChanged records
     * - database should have contained 2 AggregatedStatus record
     * - database should have contained 2 AggregatedStatusChanged record
     * - database should have contained no Tx records
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info not provided', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus([mockExistingGuardStatus]);
      await DataSourceMock.populateGuardStatusChanged([
        mockExistingGuardStatusChanged,
      ]);
      await DataSourceMock.populateAggregatedStatus([
        mockExistingAggregatedStatus,
      ]);
      await DataSourceMock.populateAggregatedStatusChanged([
        mockExistingAggregatedStatusChanged,
      ]);

      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatusAggregateChange.eventId,
        mockNewGuardStatusAggregateChange.guardPk,
        mockNewGuardStatusAggregateChange.updatedAt,
        mockNewGuardStatusAggregateChange.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        undefined,
      );

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(2);
      expect(guardStatusRecords[1]).toEqual(mockNewGuardStatusAggregateChange);
      expect(guardStatusRecords[0]).toEqual(mockExistingGuardStatus);

      expect(guardStatusChangedRecords).toHaveLength(2);
      expect(guardStatusChangedRecords[1]).toEqual(
        mockNewGuardStatusChangedAggregateChange,
      );
      expect(guardStatusChangedRecords[0]).toEqual(
        mockExistingGuardStatusChanged,
      );

      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual(mockNewAggregatedStatus);

      expect(aggregatedStatusChangedRecords).toHaveLength(2);
      expect(aggregatedStatusChangedRecords[1]).toEqual(
        mockNewAggregatedStatusChanged,
      );
      expect(aggregatedStatusChangedRecords[0]).toEqual(
        mockExistingAggregatedStatusChanged,
      );

      expect(txRecords).toHaveLength(0);
    });

    /**
     * @target PublicStatusAction.insertStatus should only update guard status and not
     * aggregated status when guard statuses exist and aggregated status is not
     * changed, tx info provided
     * @scenario
     * - populate GuardStatus table with a mock record
     * - populate GuardStatusChanged table with a mock record
     * - populate AggregatedStatus table with a mock record
     * - populate AggregatedStatusChanged table with a mock record
     * - call insertStatus
     * @expected
     * - database should have contained 2 GuardStatus records
     * - database should have contained 2 GuardStatusChanged records
     * - database should have contained a AggregatedStatus record
     * - database should have contained a AggregatedStatusChanged record
     * - database should have contained a Tx record
     */
    it('should only update guard status and not aggregated status when guard statuses exist and aggregated status is not changed, tx info provided', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus([mockExistingGuardStatus]);
      await DataSourceMock.populateGuardStatusChanged([
        mockExistingGuardStatusChanged,
      ]);
      await DataSourceMock.populateAggregatedStatus([
        mockExistingAggregatedStatus,
      ]);
      await DataSourceMock.populateAggregatedStatusChanged([
        mockExistingAggregatedStatusChanged,
      ]);

      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatus.eventId,
        mockNewGuardStatus.guardPk,
        mockNewGuardStatus.updatedAt,
        mockNewGuardStatus.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(2);
      expect(guardStatusRecords[1]).toEqual({
        ...mockNewGuardStatus,
        ...mockGuardStatusTx,
      });
      expect(guardStatusRecords[0]).toEqual(mockExistingGuardStatus);

      expect(guardStatusChangedRecords).toHaveLength(2);
      expect(guardStatusChangedRecords[1]).toEqual({
        ...mockNewGuardStatusChanged,
        ...mockGuardStatusTx,
      });
      expect(guardStatusChangedRecords[0]).toEqual(
        mockExistingGuardStatusChanged,
      );

      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual(mockExistingAggregatedStatus);

      expect(aggregatedStatusChangedRecords).toHaveLength(1);
      expect(aggregatedStatusChangedRecords[0]).toEqual(
        mockExistingAggregatedStatusChanged,
      );

      expect(txRecords).toHaveLength(1);
      expect(txRecords[0]).toEqual(mockNewTx);
    });

    /**
     * @target PublicStatusAction.insertStatus should update guard status and aggregated
     * status when guard statuses exist and aggregated status is changed, tx info provided
     * @scenario
     * - populate GuardStatus table with a mock record
     * - populate GuardStatusChanged table with a mock record
     * - populate AggregatedStatus table with a mock record
     * - populate AggregatedStatusChanged table with a mock record
     * - call insertStatus
     * @expected
     * - database should have contained 2 GuardStatus records
     * - database should have contained 2 GuardStatusChanged records
     * - database should have contained 2 AggregatedStatus records
     * - database should have contained 2 AggregatedStatusChanged records
     * - database should have contained a Tx record
     */
    it('should update guard status and aggregated status when guard statuses exist and aggregated status is changed, tx info provided', async () => {
      // arrange
      await DataSourceMock.populateGuardStatus([mockExistingGuardStatus]);
      await DataSourceMock.populateGuardStatusChanged([
        mockExistingGuardStatusChanged,
      ]);
      await DataSourceMock.populateAggregatedStatus([
        mockExistingAggregatedStatus,
      ]);
      await DataSourceMock.populateAggregatedStatusChanged([
        mockExistingAggregatedStatusChanged,
      ]);

      // act
      await PublicStatusAction.getInstance().insertStatus(
        mockNewGuardStatusAggregateChange.eventId,
        mockNewGuardStatusAggregateChange.guardPk,
        mockNewGuardStatusAggregateChange.updatedAt,
        mockNewGuardStatusAggregateChange.status,
        mockEventStatusThresholds,
        mockTxStatusThresholds,
        mockTxDTO,
      );

      const guardStatusRecords = await DataSourceMock.listGuardStatus();
      const guardStatusChangedRecords =
        await DataSourceMock.listGuardStatusChanged();
      const aggregatedStatusRecords =
        await DataSourceMock.listAggregatedStatus();
      const aggregatedStatusChangedRecords =
        await DataSourceMock.listAggregatedStatusChanged();
      const txRecords = await DataSourceMock.listTx();

      // assert
      expect(guardStatusRecords).toHaveLength(2);
      expect(guardStatusRecords[1]).toEqual({
        ...mockNewGuardStatusAggregateChange,
        ...mockGuardStatusTx,
      });
      expect(guardStatusRecords[0]).toEqual(mockExistingGuardStatus);

      expect(guardStatusChangedRecords).toHaveLength(2);
      expect(guardStatusChangedRecords[1]).toEqual({
        ...mockNewGuardStatusChangedAggregateChange,
        ...mockGuardStatusTx,
      });
      expect(guardStatusChangedRecords[0]).toEqual(
        mockExistingGuardStatusChanged,
      );

      expect(aggregatedStatusRecords).toHaveLength(1);
      expect(aggregatedStatusRecords[0]).toEqual(mockNewAggregatedStatus);

      expect(aggregatedStatusChangedRecords).toHaveLength(2);
      expect(aggregatedStatusChangedRecords[1]).toEqual(
        mockNewAggregatedStatusChanged,
      );
      expect(aggregatedStatusChangedRecords[0]).toEqual(
        mockExistingAggregatedStatusChanged,
      );

      expect(txRecords).toHaveLength(1);
      expect(txRecords[0]).toEqual(mockNewTx);
    });
  });
});
