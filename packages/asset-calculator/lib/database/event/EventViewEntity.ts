import { ViewEntity, ViewColumn } from '@rosen-bridge/extended-typeorm';
import { Network } from '@rosen-ui/types';

@ViewEntity({
  name: 'event_view',
})
export class EventViewEntity {
  @ViewColumn()
  id!: string;

  @ViewColumn()
  fromChain!: Network;

  @ViewColumn()
  toChain!: Network;

  @ViewColumn()
  fromAddress!: string;

  @ViewColumn()
  toAddress!: string;

  @ViewColumn()
  height!: number;

  @ViewColumn()
  amount!: string;

  @ViewColumn()
  networkFee!: string;

  @ViewColumn()
  bridgeFee!: string;

  @ViewColumn()
  sourceChainTokenId!: string;

  @ViewColumn()
  sourceTxId!: string;

  @ViewColumn()
  eventId!: string;

  @ViewColumn()
  timestamp!: number;

  @ViewColumn()
  WIDsCount!: number;

  @ViewColumn()
  paymentTxId!: string | null;

  @ViewColumn()
  spendTxId!: string | null;

  @ViewColumn()
  status!: 'fraud' | 'processing' | 'successful';

  @ViewColumn()
  amountNormalized!: number;

  @ViewColumn()
  networkFeeNormalized!: number;

  @ViewColumn()
  bridgeFeeNormalized!: number;
}
