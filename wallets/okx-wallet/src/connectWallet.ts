import { getOKXWallet } from './getOKXWallet';

/**
 * handles the OKX wallet connection
 */

export const connectWallet = async (): Promise<boolean> => {
  await window.okxwallet.bitcoin.connect();
  return true;
};
