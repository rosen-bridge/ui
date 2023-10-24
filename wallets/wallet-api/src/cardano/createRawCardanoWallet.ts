import { CipWalletApi, RawWallet, WalletBase } from '../types';

export const createRawCardanoWallet = (
  wallet: WalletBase
): RawWallet<CipWalletApi> => {
  return {
    ...wallet,
    api: cardano as unknown as CipWalletApi,
  };
};
