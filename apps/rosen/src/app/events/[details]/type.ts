import { ReactNode } from 'react';

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

// V2
export type EventDetails = {
  id: number;
  eventId: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  height: number;
  amount: string;
  networkFee: string;
  bridgeFee: string;
  sourceChainTokenId: string;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;
  metadata: string;
  reports: number | string;

  block: {
    hash: string;
    height: number;
    timestamp: number;
  };

  eventTrigger: {
    txId: string;
    paymentTxId?: string | null;
    spendTxId?: string | null;
    WIDsCount: number;
    result?: string | null;
  } | null;

  status: string;
};
export type StatusProps = {
  value: 'FRAUD' | 'PROCESSING' | 'SUCCESSFUL';
};

export type DetailsProps = {
  details?: EventDetailsV2;
  loading?: boolean;
  error?: ReactNode;
};

export type rowTypes = {
  id: number;
  wid: string;
  commitment: string;
  rewarded?: 'Yes' | 'No';
};
export type WatchersApiResponse = {
  commitments: number;
  triggeredBy: number;
  rewardedTo: number;
  watchers: rowTypes[];
};

/**
 * ###############################[ New Type API ]#############################################
 */

export type TokenInfoV2 = {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  [key: string]: any;
};

export type RosenChainTokenV2 = {
  tokenId: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  [key: string]: any;
};

export type TokenCollectionV2 = Record<string, RosenChainTokenV2>;

export type EventTriggerInfoV2 = {
  WIDsCount: number;
  paymentTxId: string | null;
  spendTxId: string | null;
  triggerTxId: string | null;
  status: string;
};

export type BlockInfoV2 = {
  hash: string;
  height: number;
  timestamp: Date;
};

export type EventDetailsV2 = {
  id: string;
  eventId: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  height: number;
  amount: string;
  networkFee: string;
  bridgeFee: string;
  sourceChainTokenId: string;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;

  blockHash: string;
  blockHeight: number;
  timestamp: number;

  WIDsCount: number;
  paymentTxId: string | null;
  spendTxId: string | null;
  triggerTxId: string;

  status: string;

  commitments: unknown[];
  sourceToken?: TokenInfoV2 | null;
  targetToken: TokenInfoV2 | null;
};
