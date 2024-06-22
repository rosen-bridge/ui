import { WalletCreator } from '@rosen-network/bitcoin';

import { getBalanceCreator } from './getBalance';
import { getXverseWallet } from './getXverseWallet';
import { isXverseAvailable } from './isXverseAvailable';
import { transferCreator } from './transfer';
import { getAddressCreator } from './getAddressCreator';

export const xverseWalletCreator: WalletCreator = (config) => {
  if (!isXverseAvailable()) return;
  return Object.assign({}, getXverseWallet(), {
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: getAddressCreator(config),
  });
};
