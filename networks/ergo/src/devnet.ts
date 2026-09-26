import fs from 'node:fs';

import {
  AbstractMinimumFeeNetwork,
  decodeRegister,
  MinimumFeeBox,
} from '@rosen-bridge/extended-minimum-fee';
import type { ErgoBoxWrapper } from '@rosen-bridge/minimum-fee';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

const ID = /^[0-9a-f]{64}$/;

export const isolatedDevnetEnabled = () =>
  process.env.NODE_ENV === 'development' && process.env.ERGO_DEVNET_MODE === 'isolated';

export const getDevnetMinerFee = (): bigint => {
  const value = process.env.ERGO_DEVNET_MINER_FEE;
  if (!isolatedDevnetEnabled() || !/^[1-9][0-9]*$/.test(value ?? '')) {
    throw new Error('Isolated Ergo miner fee is not configured');
  }
  return BigInt(value!);
};

const config = () => {
  if (
    !isolatedDevnetEnabled() ||
    process.env.ERGO_DEVNET_NODE_URL !== 'http://127.0.0.1:19051' ||
    !ID.test(process.env.ERGO_DEVNET_FIRST_BLOCK_ID ?? '') ||
    !ID.test(process.env.ERGO_DEVNET_TOKEN_ID ?? '') ||
    !ID.test(process.env.ERGO_DEVNET_MIN_FEE_NFT ?? '') ||
    !process.env.ERGO_DEVNET_NODE_API_KEY_FILE
  ) {
    throw new Error('Isolated Ergo devnet source is not configured');
  }
  const apiKey = JSON.parse(
    fs.readFileSync(process.env.ERGO_DEVNET_NODE_API_KEY_FILE, 'utf8'),
  ).apiKey;
  if (typeof apiKey !== 'string' || !apiKey)
    throw new Error('Isolated Ergo devnet API key unavailable');
  return { apiKey, firstBlockId: process.env.ERGO_DEVNET_FIRST_BLOCK_ID };
};

const rpc = async (route: string): Promise<unknown> => {
  const { apiKey } = config();
  const response = await fetch(`http://127.0.0.1:19051${route}`, {
    headers: { api_key: apiKey },
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Isolated Ergo devnet HTTP ${response.status}`);
  return await response.json();
};

export const getDevnetHeight = async (): Promise<number> => {
  const { firstBlockId } = config();
  const info = (await rpc('/info')) as {
    network?: string;
    appVersion?: string;
    peersCount?: number;
    fullHeight?: number;
  };
  if (
    info.network !== 'devnet' ||
    info.appVersion !== '6.0.3' ||
    info.peersCount !== 0 ||
    !Number.isSafeInteger(info.fullHeight) ||
    (info.fullHeight ?? 0) <= 0
  ) {
    throw new Error('Expected isolated Ergo 6.0.3 devnet');
  }
  const blockIds = await rpc('/blocks/at/1');
  if (!Array.isArray(blockIds) || blockIds.length !== 1 || blockIds[0] !== firstBlockId) {
    throw new Error('Ergo devnet first block differs from active deployment');
  }
  return info.fullHeight!;
};

export const calculateDevnetFee = async (
  target: Network,
  tokenId: string,
  nextHeightInterval: number,
  minFeeNft: string,
) => {
  if (
    target !== NETWORKS.zcash.key ||
    tokenId !== process.env.ERGO_DEVNET_TOKEN_ID ||
    minFeeNft !== process.env.ERGO_DEVNET_MIN_FEE_NFT ||
    !Number.isSafeInteger(nextHeightInterval) ||
    nextHeightInterval < 0
  ) {
    throw new Error('Ergo devnet fee request differs from the approved Zcash route');
  }
  const height = await getDevnetHeight();
  class IsolatedNodeNetwork extends AbstractMinimumFeeNetwork {
    getBoxesByTokenId = async (id: string): Promise<ErgoBoxWrapper[]> => {
      if (id !== minFeeNft) throw new Error('Unexpected MinFee NFT');
      const boxes = await rpc(`/blockchain/box/unspent/byTokenId/${id}?offset=0&limit=50`);
      if (!Array.isArray(boxes) || boxes.length >= 50)
        throw new Error('MinFee box search is not bounded');
      return boxes.map(
        (box: {
          boxId: string;
          transactionId: string;
          index: number;
          value: string;
          creationHeight: number;
          assets: Array<{ tokenId: string; amount: string }>;
          additionalRegisters: ErgoBoxWrapper['additionalRegisters'];
          ergoTree: string;
        }) => ({
          ...box,
          txId: box.transactionId,
          address: '',
          globalIndex: 0n,
          value: BigInt(box.value),
          assets: box.assets.map((asset) => ({
            tokenId: asset.tokenId,
            amount: BigInt(asset.amount),
          })),
        }),
      );
    };
  }
  const minFeeBox = new MinimumFeeBox(
    tokenId,
    minFeeNft,
    new IsolatedNodeNetwork(),
    decodeRegister,
  );
  if (!(await minFeeBox.fetchBox())) throw new Error('Active devnet MinFee box unavailable');
  const selected = minFeeBox.getBox();
  if (!selected?.boxId || !ID.test(selected.boxId)) throw new Error('Invalid MinFee box');
  const transaction = (await rpc(`/blockchain/transaction/byId/${selected.txId}`)) as {
    numConfirmations?: number;
  };
  if (!transaction || (transaction.numConfirmations ?? 0) < 1) {
    throw new Error('MinFee box is not confirmed');
  }
  return {
    fees: minFeeBox.getFee(NETWORKS.ergo.key, height, target),
    nextFees: minFeeBox.getFee(NETWORKS.ergo.key, height + nextHeightInterval, target),
  };
};
