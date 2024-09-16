import { isAddress, JsonRpcProvider } from 'ethers';
import { SUPPORTED_CHAINS } from './constants';
import { encodeAddress } from '@rosen-bridge/address-codec';

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
  toChain: string,
  toAddress: string,
  networkFee: string,
  bridgeFee: string
): Promise<string> => {
  // parse toChain
  const toChainCode = SUPPORTED_CHAINS.indexOf(
    toChain as (typeof SUPPORTED_CHAINS)[number]
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

  return Promise.resolve(
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
 * Verify the validity of the Ethereum address
 * @param addr input address
 * @returns
 */
export const isValidAddress = (addr: string) => {
  return isAddress(addr);
};
