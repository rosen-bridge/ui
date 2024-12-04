import { WalletCreator } from '@rosen-network/bitcoin';

import { getAddressCreator } from './getAddressCreator';
import { getBalanceCreator } from './getBalance';
import { getCtrlWallet } from './getCtrlWallet';
import { isCtrlAvailable } from './isCtrlAvailable';
import { transferCreator } from './transfer';

export const ctrlWalletCreator: WalletCreator = (config) => {
  return Object.assign({}, getCtrlWallet(), {
    isAvailable: isCtrlAvailable,
    getBalance: getBalanceCreator(config),
    transfer: transferCreator(config),
    getAddress: getAddressCreator(),
  });
};
