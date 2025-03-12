import { AggregateEventStatus, AggregateTxStatus } from '../../src/constants';
import { PublicStatusActions } from '../../src/db/PublicStatusActions';
import { AggregatedStatusChangedRepository } from '../../src/db/repositories/AggregatedStatusChangedRepository';
import { AggregatedStatusRepository } from '../../src/db/repositories/AggregatedStatusRepository';
import { GuardStatusChangedRepository } from '../../src/db/repositories/GuardStatusChangedRepository';
import { GuardStatusRepository } from '../../src/db/repositories/GuardStatusRepository';
import { TxRepository } from '../../src/db/repositories/TxRepository';
import { Utils } from '../../src/utils';
import {
  mockInsertStatusRequestsForAggregateTest,
  mockInsertStatusRequests,
  insertStatusTestData,
} from '../testData';
import { DataSourceMock } from './mocked/DataSource.mock';

describe('PublicStatusActions', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
  });

  describe('insertStatus', () => {
    /**
     * @target PublicStatusActions.insertStatus should insert AggregatedStatusChangedEntity and
     * GuardStatusChangedEntity when eventId is new
     * @dependencies
     * @scenario
     * - stub TxRepository.insertOne to return
     * - stub GuardStatusRepository.getMany to return empty array
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub GuardStatusRepository.upsertOne to return
     * - stub Utils.calcAggregatedStatus to return mocked aggregated status
     * - call insertStatus
     * @expected
     * - insertTxSpy should have been called with the correct tx information
     * - getGuardsStatusesSpy should have been called with requested eventId and an empty array for guard pks
     * - calcAggregatedStatusSpy should have been called ONCE with array of mapped guard statuses
     * - insertAggregatedStatusChangedSpy should have been called with the correct arguments
     * - insertAggregatedStatusSpy should have been called with the correct arguments
     * - insertGuardStatusChangedSpy should have been called with the correct arguments
     * - insertGuardStatusSpy should have been called with the correct arguments
     */
    it('should insert AggregatedStatusChangedEntity and GuardStatusChangedEntity when eventId is new', async () => {
      // arrange
      const insertTxSpy = vi
        .spyOn(TxRepository, 'insertOne')
        .mockResolvedValue();

      const getGuardsStatusesSpy = vi
        .spyOn(GuardStatusRepository, 'getMany')
        .mockResolvedValue([]);

      const insertAggregatedStatusChangedSpy = vi
        .spyOn(AggregatedStatusChangedRepository, 'insertOne')
        .mockResolvedValue();

      const upsertAggregatedStatusSpy = vi
        .spyOn(AggregatedStatusRepository, 'upsertOne')
        .mockResolvedValue();

      const insertGuardStatusChangedSpy = vi
        .spyOn(GuardStatusChangedRepository, 'insertOne')
        .mockResolvedValue();

      const upsertGuardStatusSpy = vi
        .spyOn(GuardStatusRepository, 'upsertOne')
        .mockResolvedValue();

      const calcAggregatedStatusSpy = vi
        .spyOn(Utils, 'calcAggregatedStatus')
        .mockReturnValue({
          status: AggregateEventStatus.waitingForConfirmation,
          txStatus: AggregateTxStatus.waitingForConfirmation,
          tx: undefined,
        });

      const request0 = mockInsertStatusRequests[0];

      // act
      await PublicStatusActions.insertStatus(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        request0.tx,
      );

      // assert
      expect(insertTxSpy).toHaveBeenCalledWith(
        request0.tx?.txId,
        request0.tx?.chain,
        request0.eventId,
        request0.timestampSeconds,
        request0.tx?.txType,
      );
      expect(getGuardsStatusesSpy).toHaveBeenCalledWith(request0.eventId, []);
      expect(calcAggregatedStatusSpy).toHaveBeenCalledWith([
        {
          guardPk: request0.guardPk,
          status: request0.status,
          tx: {
            chain: request0.tx!.chain,
            txId: request0.tx!.txId,
            txStatus: request0.tx!.txStatus,
          },
        },
      ]);
      expect(insertAggregatedStatusChangedSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.timestampSeconds,
        AggregateEventStatus.waitingForConfirmation,
        AggregateTxStatus.waitingForConfirmation,
        undefined,
      );
      expect(upsertAggregatedStatusSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.timestampSeconds,
        AggregateEventStatus.waitingForConfirmation,
        AggregateTxStatus.waitingForConfirmation,
        undefined,
      );
      expect(insertGuardStatusChangedSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        {
          chain: request0.tx!.chain,
          txId: request0.tx!.txId,
          txStatus: request0.tx!.txStatus,
        },
      );
      expect(upsertGuardStatusSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        {
          chain: request0.tx!.chain,
          txId: request0.tx!.txId,
          txStatus: request0.tx!.txStatus,
        },
      );
    });

    /**
     * @target PublicStatusActions.insertStatus should only create AggregatedStatusChangedEntity when
     * aggregated status changes
     * @dependencies
     * @scenario
     * - stub TxRepository.insertOne to return
     * - stub AggregatedStatusChangedRepository.insertOne to return
     * - stub AggregatedStatusRepository.upsertOne to return
     * - stub GuardStatusChangedRepository.insertOne to return
     * - stub GuardStatusRepository.upsertOne to return
     * - for each of the statuses:
     *   - stub GuardStatusRepository.getMany to return from sequence
     *   - stub Utils.calcAggregatedStatus to return from sequence
     *   - call insertStatus
     * @expected
     * - assert in the loop:
     *   - insertTxSpy should have been called with the correct arguments from expecting sequence
     *   - getGuardsStatusesSpy should have been called with the correct arguments from expecting sequence
     *   - calcAggregatedStatusSpy should have been called with the correct arguments from expecting sequence
     *   - insertAggregatedStatusChangedSpy should have been called with the correct arguments from expecting sequence
     *   - insertAggregatedStatusSpy should have been called with the correct arguments from expecting sequence
     *   - insertGuardStatusChangedSpy should have been called with the correct arguments from expecting sequence
     *   - insertGuardStatusSpy should have been called with the correct arguments from expecting sequence
     */
    it('should only create AggregatedStatusChangedEntity when aggregated status changes', async () => {
      // arrange
      const { returningValues, expectingSequence } = insertStatusTestData;

      const insertTxSpy = vi
        .spyOn(TxRepository, 'insertOne')
        .mockResolvedValue();
      const insertAggregatedStatusChangedSpy = vi
        .spyOn(AggregatedStatusChangedRepository, 'insertOne')
        .mockResolvedValue();
      const upsertAggregatedStatusSpy = vi
        .spyOn(AggregatedStatusRepository, 'upsertOne')
        .mockResolvedValue();
      const insertGuardStatusChangedSpy = vi
        .spyOn(GuardStatusChangedRepository, 'insertOne')
        .mockResolvedValue();
      const upsertGuardStatusSpy = vi
        .spyOn(GuardStatusRepository, 'upsertOne')
        .mockResolvedValue();

      for (
        let i = 0;
        i < mockInsertStatusRequestsForAggregateTest.length;
        i += 1
      ) {
        const req = mockInsertStatusRequestsForAggregateTest[i];

        insertTxSpy.mockClear();
        insertAggregatedStatusChangedSpy.mockClear();
        upsertAggregatedStatusSpy.mockClear();
        insertGuardStatusChangedSpy.mockClear();
        upsertGuardStatusSpy.mockClear();

        const getGuardsStatusesSpy = vi
          .spyOn(GuardStatusRepository, 'getMany')
          .mockResolvedValue(returningValues.getGuardsStatuses[i]);

        const calcAggregatedStatusSpy = vi.spyOn(Utils, 'calcAggregatedStatus');

        if (i === 0) {
          calcAggregatedStatusSpy.mockReturnValueOnce(
            returningValues.calcAggregatedStatus[i],
          );
        } else {
          calcAggregatedStatusSpy
            .mockReturnValueOnce(returningValues.calcAggregatedStatus[i])
            .mockReturnValueOnce(returningValues.calcAggregatedStatus[i - 1]);
        }

        // act
        await PublicStatusActions.insertStatus(
          req.eventId,
          req.guardPk,
          req.timestampSeconds,
          req.status,
          req.tx,
        );

        // assert
        const insertTxArgs = expectingSequence.insertTx[i];
        if (insertTxArgs) {
          expect(insertTxSpy).toHaveBeenCalledWith(...insertTxArgs);
        }

        const getGuardsStatusArgs = expectingSequence.getGuardsStatuses[i];
        if (getGuardsStatusArgs) {
          expect(getGuardsStatusesSpy).toHaveBeenCalledWith(
            ...getGuardsStatusArgs,
          );
        }

        if (i > 0) {
          expect(calcAggregatedStatusSpy).toHaveBeenCalledTimes(2);
        } else {
          expect(calcAggregatedStatusSpy).toHaveBeenCalledTimes(1);
        }

        const calcAggregatedStatusArgs =
          expectingSequence.calcAggregatedStatus[i * 2 + 1];
        if (calcAggregatedStatusArgs) {
          expect(calcAggregatedStatusSpy).toHaveBeenNthCalledWith(
            1,
            ...calcAggregatedStatusArgs,
          );
        }
        const calcAggregatedStatusArgs2 =
          expectingSequence.calcAggregatedStatus[i * 2];
        if (calcAggregatedStatusArgs2) {
          expect(calcAggregatedStatusSpy).toHaveBeenNthCalledWith(
            calcAggregatedStatusArgs ? 2 : 1,
            ...calcAggregatedStatusArgs2,
          );
        }

        const insertAggregatedStatusChangedArgs =
          expectingSequence.insertAggregatedStatusChanged[i];
        if (insertAggregatedStatusChangedArgs) {
          expect(insertAggregatedStatusChangedSpy).toHaveBeenCalledWith(
            ...insertAggregatedStatusChangedArgs,
          );
        }

        const upsertAggregatedStatusArgs =
          expectingSequence.insertAggregatedStatusChanged[i];
        if (upsertAggregatedStatusArgs) {
          expect(upsertAggregatedStatusSpy).toHaveBeenCalledWith(
            ...upsertAggregatedStatusArgs,
          );
        }

        const insertGuardStatusChangedArgs =
          expectingSequence.insertGuardStatusChanged[i];
        if (insertGuardStatusChangedArgs) {
          expect(insertGuardStatusChangedSpy).toHaveBeenCalledWith(
            ...insertGuardStatusChangedArgs,
          );
        }

        const upsertGuardStatusArgs =
          expectingSequence.insertGuardStatusChanged[i];
        if (upsertGuardStatusArgs) {
          expect(upsertGuardStatusSpy).toHaveBeenCalledWith(
            ...upsertGuardStatusArgs,
          );
        }
      }
    });
  });
});
