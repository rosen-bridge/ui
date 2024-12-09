import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateUnsignedTx,
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from '@rosen-network/bitcoin';

export type WalletConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  submitTransaction: typeof submitTransaction;
  getAddressBalance: typeof getAddressBalance;
};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    okxwallet: {
      bitcoin: {
        /**
         * TODO: replace the any type with an interface
         * local:ergo/rosen-bridge/ui#456
         */
        // eslint-disable-next-line
        [key: string]: any;
      };
    };
  }
}
