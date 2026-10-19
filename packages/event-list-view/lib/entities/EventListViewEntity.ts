import { ViewColumn, ViewEntity } from '@rosen-bridge/extended-typeorm';

export enum EventListViewStatus {
  completed = 'COMPLETED',
  created = 'CREATED',
  fraud = 'FRAUD',
  paid = 'PAID',
  paymentAborted = 'PAYMENT_ABORTED',
  paymentApproved = 'PAYMENT_APPROVED',
  paymentPending = 'PAYMENT_PENDING',
  paymentSent = 'PAYMENT_SENT',
  paymentSigned = 'PAYMENT_SIGNED',
  paymentSigning = 'PAYMENT_SIGNING',
  paymentStalled = 'PAYMENT_STALLED',
  reachedLimit = 'REACHED_LIMIT',
  rejected = 'REJECTED',
  rewarded = 'REWARDED',
  rewardAborted = 'REWARD_ABORTED',
  rewardApproved = 'REWARD_APPROVED',
  rewardPending = 'REWARD_PENDING',
  rewardSent = 'REWARD_SENT',
  rewardSigned = 'REWARD_SIGNED',
  rewardSigning = 'REWARD_SIGNING',
  rewardStalled = 'REWARD_STALLED',
  timeout = 'TIMEOUT',
  triggered = 'TRIGGERED',
}

export const eventListViewStatuses = Object.values(EventListViewStatus);

@ViewEntity({ name: 'event_list_view', materialized: true, synchronize: false })
export class EventListViewEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  fromChain: string;

  @ViewColumn()
  toChain: string;

  @ViewColumn()
  fromAddress: string;

  @ViewColumn()
  toAddress: string;

  @ViewColumn()
  height: number;

  @ViewColumn()
  amount: string;

  @ViewColumn()
  networkFee: string;

  @ViewColumn()
  bridgeFee: string;

  @ViewColumn()
  amountWithDecimal: string;

  @ViewColumn()
  networkFeeWithDecimal: string;

  @ViewColumn()
  bridgeFeeWithDecimal: string;

  @ViewColumn()
  lockTokenId: string;

  @ViewColumn()
  sourceTxId: string;

  @ViewColumn()
  eventId: string;

  @ViewColumn()
  timestamp: number | null;

  @ViewColumn()
  reports: number;

  @ViewColumn()
  triggerId: number | null;

  @ViewColumn()
  paymentTxId: string | null;

  @ViewColumn()
  spendTxId: string | null;

  @ViewColumn()
  triggerTxId: string | null;

  @ViewColumn()
  flows: number;

  @ViewColumn()
  status: EventListViewStatus;
}
