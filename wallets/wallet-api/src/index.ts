import { RawWallet, WalletBase } from './types';

export const createRawWallet = <T>(
  wallet: WalletBase,
  api: T
): RawWallet<T> => {
  return {
    ...wallet,
    api,
  };
};

export * from './cardano';
export * from './ergo';
export * from './types';
