import { RosenTokens } from '@rosen-bridge/tokens';

export const tokenMapData: RosenTokens = [
  {
    ergo: {
      tokenId:
        '1111111111111111111111111111111111111111111111111111111111111111',
      extra: {},
      name: 'test token1',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset1',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId:
        '2222222222222222222222222222222222222222222222222222222222222222',
      extra: {},
      name: 'test token2',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
    cardano: {
      tokenId: 'policyId2.assetName2',
      extra: {
        policyId: 'policyId2',
        assetName: 'assetName2',
      },
      name: 'asset2',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
  },
  {
    ergo: {
      tokenId: 'tokenId',
      extra: {},
      name: 'test token3',
      decimals: 0,
      type: 'tokenType',
      residency: 'wrapped',
    },
    cardano: {
      tokenId: 'policyId3.assetName3',
      extra: {
        policyId: 'policyId3',
        assetName: 'assetName3',
      },
      name: 'asset3',
      decimals: 0,
      type: 'tokenType',
      residency: 'native',
    },
  },
];

export const eventTriggerData = [
  {
    eventId: 'e5',
    boxId: 'b5',
    block: 'blk5',
    height: 105,
    extractor: 'ext5',
    fromChain: 'ergo',
    toChain: 'cardano',
    txId: 'tx5',
    fromAddress: 'addr5',
    toAddress: 'addr6',
    amount: '3',
    bridgeFee: '0.3',
    networkFee: '0.03',
    sourceChainTokenId: 't1',
    sourceChainHeight: 105,
    targetChainTokenId: 't2',
    sourceTxId: 'stx5',
    sourceBlockId: 'sb5',
    spendBlock: 'sblk5',
    spendHeight: 115,
    spendTxId: 'spendtx5',
    result: 'Success',
    paymentTxId: 'ptx5',
    WIDsCount: 1,
    WIDsHash: 'hash5',
    serialized: '{}',
  },
];
