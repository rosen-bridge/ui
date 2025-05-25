import type {
  generateUnsignedTx,
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from '@rosen-network/bitcoin';

import { WalletConnectConfig } from '../abstract/types';

export type WalletConnectBitcoinConfig = WalletConnectConfig & {
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  submitTransaction: typeof submitTransaction;
  getAddressBalance: typeof getAddressBalance;
};
