import { getUtxos } from './wallet/getUtxos';
import { getBalance } from './wallet/getBalance';
import { getChangeAddress } from './wallet/getChangeAddr';
import { sign } from './wallet/sign';
import { submit } from './wallet/submit';
import { createTransaction } from './wallet/transaction';
import { RawTx, Wallet } from '../types';

import { CardanoWalletRaw } from '.';

import { ConnectorContextApi, RawUnsignedTx } from '../bridges';

export const createCardanoWallet = (wallet: Wallet): CardanoWalletRaw => {
  const enableWrapper = async <T>(
    fn: (context: ConnectorContextApi, ...rest: any[]) => Promise<T>,
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
    createTransaction,
    ...wallet,
  };
};
