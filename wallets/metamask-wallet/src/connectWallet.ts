import { getMetaMaskWallet } from './getMetaMaskWallet';

/**
 * handles the MetaMask wallet connection
 */

let waiting;

export const connectWallet = async (): Promise<boolean> => {
  waiting ||= getMetaMaskWallet().getApi().connect();

  try {
    await waiting;
    waiting = undefined;
    return true;
  } catch {
    waiting = undefined;
    return false;
  }
};
