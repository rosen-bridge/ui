import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

/**
 * builds a firo: payment URI with amount and op_return metadata
 * @param address - lock address
 * @param amount - amount in FIRO (decimal string)
 * @param opReturnData - hex-encoded OP_RETURN data
 */
export const buildPaymentUri = (
  address: string,
  amount: string,
  opReturnData: string,
): string => {
  return `firo:${address}?amount=${amount}&op_return=${opReturnData}`;
};

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
  const addressLengthCode = (addressHex.length / 2)
    .toString(16)
    .padStart(2, '0');

  return Promise.resolve(
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex,
  );
};

const getHeight = async (): Promise<number> => {
  const firoExplorerUrl = `${process.env.FIRO_EXPLORER_API}`;
  const response = await fetch(`${firoExplorerUrl}/status?q=getInfo`);
  if (!response.ok) {
    throw Error(
      `Cannot fetch Firo height from explorer: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { info?: { blocks?: number } };
  const height = data.info?.blocks;
  if (typeof height !== 'number') {
    throw Error('Cannot parse Firo height from explorer response');
  }

  return height;
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.firo.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.firo.key,
  calculateFee,
);
