import { FeeData, isAddress, JsonRpcProvider } from 'ethers';
import { NETWORK_VALUES } from '@rosen-ui/constants';
import { encodeAddress } from '@rosen-bridge/address-codec';
import { Network } from '@rosen-ui/types';

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param fromAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateLockData = async (
  toChain: Network,
  toAddress: string,
  networkFee: string,
  bridgeFee: string
): Promise<string> => {
  // parse toChain
  const toChainCode = NETWORK_VALUES.indexOf(
    toChain as (typeof NETWORK_VALUES)[number]
  );
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

  return (
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex
  );
};

/**
 * gets Ethereum current block height
 * @returns
 */
export const getHeight = async (): Promise<number> => {
  return await new JsonRpcProvider(
    process.env.ETHEREUM_BLAST_API
  ).getBlockNumber();
};

/**
 * gets Ethereum fee data
 * @returns
 */
export const getFeeData = async (): Promise<FeeData> => {
  return await new JsonRpcProvider(process.env.ETHEREUM_BLAST_API).getFeeData();
};

/**
 * Verify the validity of the Ethereum address
 * @param addr input address
 * @returns
 */
export const isValidAddress = (addr: string) => {
  return isAddress(addr);
};
