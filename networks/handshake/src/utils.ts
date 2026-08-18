import Axios from 'axios';

import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  type CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateOpReturnData = async (
  toChain: Network,
  toAddress: string,
  networkFee: string,
  bridgeFee: string,
): Promise<string> => {
  // parse toChain
  const toChainCode = (NETWORKS[toChain]?.index ?? -1) as number;
  if (toChainCode === -1) throw Error(`invalid toChain [${toChain}]`);
  const toChainHex = toChainCode.toString(16).padStart(2, '0');

  // parse bridgeFee
  const bridgeFeeHex = BigInt(bridgeFee).toString(16).padStart(16, '0');

  // parse networkFee
  const networkFeeHex = BigInt(networkFee).toString(16).padStart(16, '0');

  // parse toAddress
  const addressHex = encodeAddress(toChain, toAddress);
  const addressLengthCode = (addressHex.length / 2).toString(16).padStart(2, '0');

  return Promise.resolve(
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex,
  );
};

const getHeight = async (): Promise<number> => {
  const rpcUrl = process.env.HANDSHAKE_RPC_API;
  if (!rpcUrl) throw Error('HANDSHAKE_RPC_API is not configured');

  const res = await Axios.post<{ result: { blocks: number } }>(rpcUrl, {
    method: 'getblockchaininfo',
    params: [],
  });

  return res.data.result.blocks;
};

export const calculateFee: CalculateFee = calculateFeeCreator(NETWORKS.handshake.key, getHeight);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.handshake.key,
  calculateFee,
);
