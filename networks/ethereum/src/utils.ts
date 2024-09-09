import { JsonRpcProvider } from 'ethers';
import { isHexString } from 'ethers';

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
  return isHexString(addr);
};
