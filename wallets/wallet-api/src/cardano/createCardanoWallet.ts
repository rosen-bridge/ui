import { CipWalletApi, RawTx, RawUnsignedTx, Wallet } from '../types';
import { getBalance } from './wallet/getBalance';
import { getChangeAddress } from './wallet/getChangeAddr';
import { getUtxos } from './wallet/getUtxos';
import { sign } from './wallet/sign';
import { submit } from './wallet/submit';
import { transfer } from './wallet/transaction';

import { CardanoWalletRaw } from '.';

export const createCardanoWallet = (wallet: Wallet): CardanoWalletRaw => {
  const enableWrapper = async <T>(
    fn: (context: CipWalletApi, ...rest: any[]) => Promise<T>,
    ...args: any[]
  ) => {
    const context = await cardano[wallet.name]?.enable();
    const res = await fn(context, ...args);
    return res;
  };

  return {
    getUtxos: () => enableWrapper(getUtxos),
    getBalance: () => enableWrapper(getBalance),
    getChangeAddress: () => enableWrapper(getChangeAddress),
    sign: (tx: RawUnsignedTx, partialSign = false) =>
      enableWrapper(sign, tx, partialSign),
    submit: (tx: RawTx) => enableWrapper(submit, tx),
    transfer,
    ...wallet,
  };
};
