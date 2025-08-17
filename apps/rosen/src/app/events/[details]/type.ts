import { EventItem } from '@/types';

export type BridgeEvent = EventItem & {
  status: 'fraud' | 'processing' | 'successful' | undefined;
  eventTriggers: eventsTypes;
  sourceChainTokenId: string;
};
//todo : check this types
type eventsTypes = {
  id: number;
  boxId: string;
  block: string;
  height: number;
  spendBlock: string | null;
  spendHeight: number | null;
  extractor: string;
  serialized: string;
  eventId: string;
  txId: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  bridgeFee: string;
  networkFee: string;
  sourceChainTokenId: string;
  sourceChainHeight: number;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
  WIDsCount: number;
  WIDsHash: string;
  spendTxId: string | null;
  result: string | null;
  paymentTxId: string | null;
};
