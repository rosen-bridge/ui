import { encodeAddress } from '@rosen-bridge/address-codec';
import { NETWORK_VALUES } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { FeeData, isAddress, JsonRpcProvider } from 'ethers';

import { EvmChains } from './types';

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
  bridgeFee: string,
): Promise<string> => {
  // parse toChain
  const toChainCode = NETWORK_VALUES.indexOf(
    toChain as (typeof NETWORK_VALUES)[number],
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
 * gets EVM chain current block height
 * @returns
 */
export const getHeight = async (chain: EvmChains): Promise<number> => {
  return await new JsonRpcProvider(getChainRpcUrl(chain)).getBlockNumber();
};

/**
 * gets EVM chain fee data
 * @returns
 */
export const getFeeData = async (chain: EvmChains): Promise<FeeData> => {
  return await new JsonRpcProvider(getChainRpcUrl(chain)).getFeeData();
};

/**
 * Verify the validity of the Ethereum address
 * @param addr input address
 * @returns
 */
export const isValidAddress = (addr: string) => {
  return isAddress(addr);
};

/**
 * returns the corresponding chain RPC url
 * @param chain
 */
const getChainRpcUrl = (chain: EvmChains) => {
  switch (chain) {
    case EvmChains.ETHEREUM:
      return process.env.ETHEREUM_RPC_API;
    case EvmChains.BINANCE:
      return process.env.BINANCE_RPC_API;
    default:
      throw Error(`chain [${chain}] is not registered as an EVM chain`);
  }
};
