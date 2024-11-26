import { RawWallet, WalletBase } from './types';

export const createRawWallet = <T>(
  wallet: WalletBase,
  getApi: () => T,
): RawWallet<T> => {
  return {
    ...wallet,
    getApi,
  };
};

export * from './cardano';
export * from './ergo';
export * from './types';
