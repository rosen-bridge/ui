/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../../src/constants';
import { GuardStatusChangedEntity } from '../../src/db/entities/GuardStatusChangedEntity';
import { TxEntity } from '../../src/db/entities/TxEntity';
import { EventStatusActions } from '../../src/db/EventStatusActions';
import { AggregatedStatus } from '../../src/utils';
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
import DatabaseActionMock from './mocked/EventStatusActor.mock';

describe('EventStatusActions', () => {
  const actor = DatabaseActionMock.actor;

  beforeEach(async () => {
    await DatabaseActionMock.clearTables();
  });

  describe('insertStatus', () => {
    /**
     * @target EventStatusActions.insertStatus should insert OverallStatusChanged and
     * GuardStatusChanged when eventId is new
     * @dependencies
     * @scenario
     * - stub actor.insertTx to return
     * - stub actor.getGuardsLastStatus to return empty array
     * - stub actor.insertOverallStatus to return
     * - stub actor.insertGuardStatus to return
     * - stub Utils.calcAggregatedStatus to return mocked aggregated status
     * - call insertStatus
     * @expected
     * - insertTxSpy should have been called with the correct arguments
     * - getGuardsLastStatusSpy should have been called with the correct arguments
     * - calcAggregatedStatusSpy should have been called ONCE with the correct arguments
     * - insertOverallStatusSpy should have been called with the correct arguments
     * - insertGuardStatusSpy should have been called with the correct arguments
     */
    it('should insert OverallStatusChanged and GuardStatusChanged when eventId is new', async () => {
      // arrange
      const insertTxSpy = vi
        .spyOn(actor, 'insertTx')
        .mockResolvedValue(undefined);

      const getGuardsLastStatusSpy = vi
        .spyOn(actor, 'getGuardsLastStatus')
        .mockResolvedValue([]);

      const insertOverallStatusSpy = vi
        .spyOn(actor, 'insertOverallStatus')
        .mockResolvedValue(undefined);

      const insertGuardStatusSpy = vi
        .spyOn(actor, 'insertGuardStatus')
        .mockResolvedValue(undefined);

      const calcAggregatedStatusSpy = vi
        .spyOn(Utils, 'calcAggregatedStatus')
        .mockReturnValue({
          status: AggregateEventStatus.waitingForConfirmation,
          txId: undefined,
          txStatus: AggregateTxStatus.waitingForConfirmation,
        });

      const request0 = fakeInsertStatusRequests[0];

      // act
      await EventStatusActions.insertStatus(
        request0.insertedAt,
        request0.guardPk,
        request0.eventId,
        request0.status,
        request0.txId,
        request0.txType,
        request0.txStatus,
      );

      // assert
      expect(insertTxSpy).toHaveBeenCalledWith(
        request0.txId,
        request0.eventId,
        request0.insertedAt,
        request0.txType,
      );
      expect(getGuardsLastStatusSpy).toHaveBeenCalledWith(request0.eventId);
      expect(calcAggregatedStatusSpy).toHaveBeenCalledWith([
        {
          guardPk: request0.guardPk,
          status: request0.status,
          txId: request0.txId,
          txStatus: request0.txStatus,
        },
      ]);
      expect(insertOverallStatusSpy).toHaveBeenCalledWith(
        request0.insertedAt,
        request0.eventId,
        AggregateEventStatus.waitingForConfirmation,
        undefined,
        AggregateTxStatus.waitingForConfirmation,
      );
      expect(insertGuardStatusSpy).toHaveBeenCalledWith(
        request0.insertedAt,
        request0.guardPk,
        request0.eventId,
        request0.status,
        request0.txId,
        request0.txStatus,
      );
    });

    /**
     * @target EventStatusActions.insertStatus should only create OverallStatusChangedEntity when
     * aggregated status changes
     * @dependencies
     * @scenario
     * - stub actor.insertTx to return
     * - stub actor.insertOverallStatus to return
     * - stub actor.insertGuardStatus to return
     * - for each of the statuses:
     *   - stub actor.getGuardsLastStatus to return from sequence
     *   - stub Utils.calcAggregatedStatus to return from sequence
     *   - call insertStatus
     * @expected
     * - assert in the loop:
     *   - insertTxSpy should have been called with the correct arguments from expecting sequence
     *   - getGuardsLastStatusSpy should have been called with the correct arguments from expecting sequence
     *   - calcAggregatedStatusSpy should have been called with the correct arguments from expecting sequence
     *   - insertOverallStatusSpy should have been called with the correct arguments from expecting sequence
     *   - insertGuardStatusSpy should have been called with the correct arguments from expecting sequence
     */
    it('should only create OverallStatusChangedEntity when aggregated status changes', async () => {
      // arrange
      const returningValues: {
        getGuardsLastStatus: GuardStatusChangedEntity[][];
        calcAggregatedStatus: AggregatedStatus[];
      } = {
        getGuardsLastStatus: [
          [],
          [
            {
              id: 1,
              eventId: id0,
              guardPk: guardPk3,
              insertedAt: 900,
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
              insertedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              insertedAt: 1000,
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
              insertedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              insertedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 3,
              eventId: id0,
              guardPk: guardPk1,
              insertedAt: 1005,
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
              insertedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              insertedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 3,
              eventId: id0,
              guardPk: guardPk1,
              insertedAt: 1005,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 4,
              eventId: id0,
              guardPk: guardPk2,
              insertedAt: 1006,
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
              insertedAt: 900,
              status: EventStatus.pendingReward,
              tx: null,
              txStatus: null,
            },
            {
              id: 2,
              eventId: id0,
              guardPk: guardPk0,
              insertedAt: 1000,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 4,
              eventId: id0,
              guardPk: guardPk2,
              insertedAt: 1006,
              status: EventStatus.inReward,
              tx: { txId: id0, txType: TxType.reward } as unknown as TxEntity,
              txStatus: TxStatus.signed,
            },
            {
              id: 5,
              eventId: id0,
              guardPk: guardPk1,
              insertedAt: 1010,
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
        getGuardsLastStatus: [[id0], [id0], [id0], [id0], [id0], [id0]],
        insertOverallStatus: [
          [
            900,
            id0,
            AggregateEventStatus.waitingForConfirmation,
            undefined,
            AggregateTxStatus.waitingForConfirmation,
          ],
          undefined,
          undefined,
          [
            1006,
            id0,
            AggregateEventStatus.inReward,
            id0,
            AggregateTxStatus.signed,
          ],
          [
            1010,
            id0,
            AggregateEventStatus.waitingForConfirmation,
            undefined,
            AggregateTxStatus.waitingForConfirmation,
          ],
          [
            1012,
            id0,
            AggregateEventStatus.inReward,
            id0,
            AggregateTxStatus.signed,
          ],
        ],
        insertGuardStatus: [
          [900, guardPk3, id0, EventStatus.pendingReward, undefined, undefined],
          [1000, guardPk0, id0, EventStatus.inReward, id0, TxStatus.signed],
          [1005, guardPk1, id0, EventStatus.inReward, id0, TxStatus.signed],
          [1006, guardPk2, id0, EventStatus.inReward, id0, TxStatus.signed],
          [
            1010,
            guardPk1,
            id0,
            EventStatus.pendingReward,
            undefined,
            undefined,
          ],
          [1012, guardPk3, id0, EventStatus.inReward, id0, TxStatus.signed],
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

      const insertTxSpy = vi.spyOn(actor, 'insertTx').mockResolvedValue();
      const insertOverallStatusSpy = vi
        .spyOn(actor, 'insertOverallStatus')
        .mockResolvedValue();
      const insertGuardStatusSpy = vi
        .spyOn(actor, 'insertGuardStatus')
        .mockResolvedValue();

      for (let i = 0; i < aggregateTestInsertStatusRequests.length; i += 1) {
        const req = aggregateTestInsertStatusRequests[i];

        insertTxSpy.mockClear();
        insertOverallStatusSpy.mockClear();
        insertGuardStatusSpy.mockClear();

        const getGuardsLastStatusSpy = vi
          .spyOn(actor, 'getGuardsLastStatus')
          .mockResolvedValue(returningValues.getGuardsLastStatus[i]);

        const calcAggregatedStatusSpy = vi.spyOn(Utils, 'calcAggregatedStatus');
        if (i > 0) {
          calcAggregatedStatusSpy.mockReturnValueOnce(
            returningValues.calcAggregatedStatus[i - 1],
          );
        }
        calcAggregatedStatusSpy.mockReturnValueOnce(
          returningValues.calcAggregatedStatus[i],
        );

        // act
        await EventStatusActions.insertStatus(
          req.insertedAt,
          req.guardPk,
          req.eventId,
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

        const getGuardsLastStatusArgs =
          expectingSequence.getGuardsLastStatus[i];
        if (getGuardsLastStatusArgs) {
          expect(getGuardsLastStatusSpy).toHaveBeenCalledWith(
            ...getGuardsLastStatusArgs,
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

        const insertOverallStatusArgs =
          expectingSequence.insertOverallStatus[i];
        if (insertOverallStatusArgs) {
          expect(insertOverallStatusSpy).toHaveBeenCalledWith(
            ...insertOverallStatusArgs,
          );
        }

        const insertGuardStatusArgs = expectingSequence.insertGuardStatus[i];
        if (insertGuardStatusArgs) {
          expect(insertGuardStatusSpy).toHaveBeenCalledWith(
            ...insertGuardStatusArgs,
          );
        }
      }
    });
  });
});
