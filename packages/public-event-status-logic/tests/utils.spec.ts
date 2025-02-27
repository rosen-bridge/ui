import { describe, expect, it } from 'vitest';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from '../src/constants';
import { Utils, StatusForAggregate } from '../src/utils';
import { guardPk0, guardPk1, guardPk2, id0 } from './testData';

describe('Utils', () => {
  describe('calcAggregatedStatus', () => {
    /**
     * @target Utils.calcAggregatedStatus should return waitingForConfirmation status if
     * no threshold is triggered
     * @dependencies
     * @scenario
     * - call calcAggregatedStatus with 3 different values
     * @expected
     * - each call of calcAggregatedStatus should have returned its correct value
     */
    it('should return waitingForConfirmation status if no threshold is triggered', async () => {
      // arrange
      const statuses0: StatusForAggregate[] = [];
      const statuses1: StatusForAggregate[] = [
        {
          guardPk: guardPk0,
          status: EventStatus.pendingPayment,
        },
      ];
      const statuses2: StatusForAggregate[] = [
        {
          guardPk: guardPk0,
          status: EventStatus.inPayment,
          txId: id0,
          txStatus: TxStatus.approved,
        },
      ];

      // act
      const result0 = Utils.calcAggregatedStatus(statuses0);
      const result1 = Utils.calcAggregatedStatus(statuses1);
      const result2 = Utils.calcAggregatedStatus(statuses2);

      // assert
      expect(result0).toMatchObject({
        status: AggregateEventStatus.waitingForConfirmation,
        txId: undefined,
        txStatus: AggregateTxStatus.waitingForConfirmation,
      });

      expect(result1).toMatchObject({
        status: AggregateEventStatus.waitingForConfirmation,
        txId: undefined,
        txStatus: AggregateTxStatus.waitingForConfirmation,
      });

      expect(result2).toMatchObject({
        status: AggregateEventStatus.waitingForConfirmation,
        txId: undefined,
        txStatus: AggregateTxStatus.waitingForConfirmation,
      });
    });

    /**
     * @target calcAggregatedStatus should return the correct aggregated status
     * @dependencies
     * @scenario
     * - call calcAggregatedStatus with array of statuses that won't result in waitingForConfirmation
     * @expected
     * - should have returned the correct value
     */
    it('should return the correct aggregated status', async () => {
      // arrange
      const statuses: StatusForAggregate[] = [
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
      ];

      // act
      const result = Utils.calcAggregatedStatus(statuses);

      // assert
      expect(result).toMatchObject({
        status: AggregateEventStatus.inReward,
        txId: id0,
        txStatus: AggregateTxStatus.signed,
      });
    });
  });
});
