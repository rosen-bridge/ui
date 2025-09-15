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
 *
 */
export type TokenInfoV2 = {
  tokenId: string;
  name: string;
  symbol?: string;
  significantDecimals?: number;
  [key: string]: any;
};

export type RosenChainTokenV2 = {
  tokenId: string;
  name?: string;
  symbol?: string;
  significantDecimals?: number;
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
  totalFee: string;
  sourceChainTokenId: string;
  targetChainTokenId: string;
  sourceTxId: string;
  sourceBlockId: string;

  blockHash: string;
  blockHeight: number;
  timestamp: number;

  WIDsCount: number;
  paymentTxId: string;
  spendTxId: string;
  triggerTxId: string;

  status: string;

  commitments: unknown[];
  sourceToken?: TokenInfoV2 | null;
  targetToken: TokenInfoV2 | null;
};
