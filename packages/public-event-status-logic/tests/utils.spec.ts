/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest';

import {
  AggregateEventStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../src/constants';
import { GuardStatusChangedEntity } from '../src/db/entities/GuardStatusChangedEntity';
import { getMajorityFromStatuses } from '../src/utils';

describe('utils', () => {
  describe('getMajorityFromStatuses', () => {
    it('should return waitingForConfirmation for event status if no threshold is triggered and undefined for tx status', async () => {
      let statuses: GuardStatusChangedEntity[] = [];

      let result = getMajorityFromStatuses(statuses);

      expect(result.status).toBe(AggregateEventStatus.waitingForConfirmation);
      expect(result.txId).toBeUndefined();
      expect(result.txType).toBeUndefined();
      expect(result.txStatus).toBeUndefined();

      //

      statuses = [
        {
          id: 0,
          eventId:
            '0000000000000000000000000000000000000000000000000000000000000000',
          guardPk:
            '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1',
          insertedAt: 0,
          status: EventStatus.pendingPayment,
        },
      ];

      result = getMajorityFromStatuses(statuses);

      expect(result.status).toBe(AggregateEventStatus.waitingForConfirmation);
      expect(result.txId).toBeUndefined();
      expect(result.txType).toBeUndefined();
      expect(result.txStatus).toBeUndefined();
    });

    it('should return the correct event status', async () => {
      let statuses: GuardStatusChangedEntity[] = [
        {
          id: 0,
          eventId:
            '0000000000000000000000000000000000000000000000000000000000000000',
          guardPk:
            '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e0',
          insertedAt: 0,
          status: EventStatus.inReward,
          txId: '0000000000000000000000000000000000000000000000000000000000000000',
          txType: TxType.reward,
          txStatus: TxStatus.signed,
        },
        {
          id: 1,
          eventId:
            '0000000000000000000000000000000000000000000000000000000000000000',
          guardPk:
            '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1',
          insertedAt: 1,
          status: EventStatus.inReward,
          txId: '0000000000000000000000000000000000000000000000000000000000000000',
          txType: TxType.reward,
          txStatus: TxStatus.signed,
        },
        {
          id: 2,
          eventId:
            '0000000000000000000000000000000000000000000000000000000000000000',
          guardPk:
            '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e2',
          insertedAt: 2,
          status: EventStatus.inReward,
          txId: '0000000000000000000000000000000000000000000000000000000000000000',
          txType: TxType.reward,
          txStatus: TxStatus.signed,
        },
      ];

      let result = getMajorityFromStatuses(statuses);

      expect(result.status).toBe(AggregateEventStatus.inReward);
      expect(result.txId).toBe(
        '0000000000000000000000000000000000000000000000000000000000000000',
      );
      expect(result.txType).toBe(TxType.reward);
      expect(result.txStatus).toBe(TxStatus.signed);
    });
  });
});
