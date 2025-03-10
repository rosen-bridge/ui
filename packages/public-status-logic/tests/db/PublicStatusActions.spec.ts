import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../../src/constants';
import { TxEntity } from '../../src/db/entities/TxEntity';
import { PublicStatusActions } from '../../src/db/PublicStatusActions';
import { AggregatedStatusChangedRepository } from '../../src/db/repositories/AggregatedStatusChangedRepository';
import { AggregatedStatusRepository } from '../../src/db/repositories/AggregatedStatusRepository';
import { GuardStatusChangedRepository } from '../../src/db/repositories/GuardStatusChangedRepository';
import { GuardStatusRepository } from '../../src/db/repositories/GuardStatusRepository';
import { TxRepository } from '../../src/db/repositories/TxRepository';
import { Utils } from '../../src/utils';
import {
  id0,
  aggregateTestInsertStatusRequests,
  fakeInsertStatusRequests,
  guardPk3,
  guardPk1,
  guardPk0,
  guardPk2,
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
          txId: undefined,
          txStatus: AggregateTxStatus.waitingForConfirmation,
        });

      const request0 = fakeInsertStatusRequests[0];

      // act
      await PublicStatusActions.insertStatus(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        request0.txId,
        request0.txType,
        request0.txStatus,
      );

      // assert
      expect(insertTxSpy).toHaveBeenCalledWith(
        request0.txId,
        request0.eventId,
        request0.timestampSeconds,
        request0.txType,
      );
      expect(getGuardsStatusesSpy).toHaveBeenCalledWith(request0.eventId, []);
      expect(calcAggregatedStatusSpy).toHaveBeenCalledWith([
        {
          guardPk: request0.guardPk,
          status: request0.status,
          txId: request0.txId,
          txStatus: request0.txStatus,
        },
      ]);
      expect(insertAggregatedStatusChangedSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.timestampSeconds,
        AggregateEventStatus.waitingForConfirmation,
        undefined,
        AggregateTxStatus.waitingForConfirmation,
      );
      expect(upsertAggregatedStatusSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.timestampSeconds,
        AggregateEventStatus.waitingForConfirmation,
        undefined,
        AggregateTxStatus.waitingForConfirmation,
      );
      expect(insertGuardStatusChangedSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        request0.txId,
        request0.txStatus,
      );
      expect(upsertGuardStatusSpy).toHaveBeenCalledWith(
        request0.eventId,
        request0.guardPk,
        request0.timestampSeconds,
        request0.status,
        request0.txId,
        request0.txStatus,
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
      const returningValues = {
        getGuardsStatuses: [
          [],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              updatedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
          ],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              updatedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              updatedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
          ],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              updatedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              updatedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 3,
              eventId: id0,
              guardPk: guardPk1,
              updatedAt: 1005,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
          ],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              updatedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              updatedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 3,
              eventId: id0,
              guardPk: guardPk1,
              updatedAt: 1005,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 4,
              eventId: id0,
              guardPk: guardPk2,
              updatedAt: 1006,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
          ],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              updatedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              updatedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 4,
              eventId: id0,
              guardPk: guardPk2,
              updatedAt: 1006,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 5,
              eventId: id0,
              guardPk: guardPk1,
              updatedAt: 1010,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
          ],
        ],
        calcAggregatedStatus: [
          {
            status: AggregateEventStatus.waitingForConfirmation,
            txId: undefined,
            txStatus: AggregateTxStatus.waitingForConfirmation,
          },
          {
            status: AggregateEventStatus.waitingForConfirmation,
            txId: undefined,
            txStatus: AggregateTxStatus.waitingForConfirmation,
          },
          {
            status: AggregateEventStatus.waitingForConfirmation,
            txId: undefined,
            txStatus: AggregateTxStatus.waitingForConfirmation,
          },
          {
            status: AggregateEventStatus.inReward,
            txId: id0,
            txStatus: AggregateTxStatus.signed,
          },
          {
            status: AggregateEventStatus.waitingForConfirmation,
            txId: undefined,
            txStatus: AggregateTxStatus.waitingForConfirmation,
          },
          {
            status: AggregateEventStatus.inReward,
            txId: id0,
            txStatus: AggregateTxStatus.signed,
          },
        ],
      };

      const expectingSequence = {
        insertTx: [
          undefined,
          [id0, id0, 1000, TxType.reward],
          undefined,
          undefined,
          undefined,
          undefined,
        ],
        getGuardsStatuses: [
          [id0, []],
          [id0, []],
          [id0, []],
          [id0, []],
          [id0, []],
          [id0, []],
        ],
        insertAggregatedStatusChanged: [
          [
            id0,
            900,
            AggregateEventStatus.waitingForConfirmation,
            undefined,
            AggregateTxStatus.waitingForConfirmation,
          ],
          undefined,
          undefined,
          [
            id0,
            1006,
            AggregateEventStatus.inReward,
            id0,
            AggregateTxStatus.signed,
          ],
          [
            id0,
            1010,
            AggregateEventStatus.waitingForConfirmation,
            undefined,
            AggregateTxStatus.waitingForConfirmation,
          ],
          [
            id0,
            1012,
            AggregateEventStatus.inReward,
            id0,
            AggregateTxStatus.signed,
          ],
        ],
        insertGuardStatusChanged: [
          [id0, guardPk3, 900, EventStatus.pendingReward, undefined, undefined],
          [id0, guardPk0, 1000, EventStatus.inReward, id0, TxStatus.signed],
          [id0, guardPk1, 1005, EventStatus.inReward, id0, TxStatus.signed],
          [id0, guardPk2, 1006, EventStatus.inReward, id0, TxStatus.signed],
          [
            id0,
            guardPk1,
            1010,
            EventStatus.pendingReward,
            undefined,
            undefined,
          ],
          [id0, guardPk3, 1012, EventStatus.inReward, id0, TxStatus.signed],
        ],
        calcAggregatedStatus: [
          undefined,
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk2,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk2,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk2,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk3,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk2,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
            ],
          ],
          [
            [
              {
                guardPk: guardPk0,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk2,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
              {
                guardPk: guardPk1,
                status: EventStatus.pendingReward,
                txId: undefined,
                txStatus: undefined,
              },
              {
                guardPk: guardPk3,
                status: EventStatus.inReward,
                txId: id0,
                txStatus: TxStatus.signed,
              },
            ],
          ],
        ],
      };

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

      for (let i = 0; i < aggregateTestInsertStatusRequests.length; i += 1) {
        const req = aggregateTestInsertStatusRequests[i];

        insertTxSpy.mockClear();
        insertAggregatedStatusChangedSpy.mockClear();
        upsertAggregatedStatusSpy.mockClear();
        insertGuardStatusChangedSpy.mockClear();
        upsertGuardStatusSpy.mockClear();

        const getGuardsStatusesSpy = vi
          .spyOn(GuardStatusRepository, 'getMany')
          .mockResolvedValue(returningValues.getGuardsStatuses[i]);

        const calcAggregatedStatusSpy = vi.spyOn(Utils, 'calcAggregatedStatus');

        if (i > 0) {
          calcAggregatedStatusSpy
            .mockReturnValueOnce(returningValues.calcAggregatedStatus[i])
            .mockReturnValueOnce(returningValues.calcAggregatedStatus[i - 1]);
        } else {
          calcAggregatedStatusSpy.mockReturnValueOnce(
            returningValues.calcAggregatedStatus[i],
          );
        }

        // act
        await PublicStatusActions.insertStatus(
          req.eventId,
          req.guardPk,
          req.timestampSeconds,
          req.status,
          req.txId,
          req.txType,
          req.txStatus,
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

        const calcAggregatedStatusArgs =
          expectingSequence.calcAggregatedStatus[i * 2];
        if (calcAggregatedStatusArgs) {
          expect(calcAggregatedStatusSpy).toHaveBeenCalledWith(
            ...calcAggregatedStatusArgs,
          );
        }
        const calcAggregatedStatusArgs2 =
          expectingSequence.calcAggregatedStatus[i * 2 + 1];
        if (calcAggregatedStatusArgs2) {
          expect(calcAggregatedStatusSpy).toHaveBeenCalledWith(
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
