import { ViewColumn, ViewEntity } from '@rosen-bridge/extended-typeorm';

import type { EventListViewStatus } from '../types';

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
