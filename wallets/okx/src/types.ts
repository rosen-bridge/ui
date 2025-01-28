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
      selectedAddress?: string;
      bitcoin: {
        connect(): Promise<void>;
        getAccounts(): Promise<string>;
        getBalance(): Promise<{ confirmed: string }>;
        signPsbt(
          psbtHex: string,
          options: {
            autoFinalized: boolean;
            toSignInputs: { address: string; index: number }[];
          },
        ): Promise<string>;
      };
    };
  }
}
