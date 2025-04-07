import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateUnsignedTx,
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from '@rosen-network/bitcoin';
import { Network } from '@rosen-ui/types';

export type ChainConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  submitTransaction: typeof submitTransaction;
  getAddressBalance: typeof getAddressBalance;
};

export type WalletConfig = {
  [chain in Network]?: ChainConfig;
};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    okxwallet: {
      selectedAddress?: string;
      bitcoin: {
        connect(): Promise<{
          address: string;
          compressedPublicKey: string;
          publicKey: string;
        }>;
        disconnect(): Promise<void>;
        getAccounts(): Promise<string[]>;
        getBalance(): Promise<{
          confirmed: number;
          total: number;
          unconfirmed: number;
        }>;
        signPsbt(
          psbtHex: string,
          options: {
            autoFinalized: boolean;
            toSignInputs: { address: string; index: number }[];
          },
        ): Promise<string>;
      };
      // Doge interface uses the same API as Bitcoin in OKX wallet
      doge?: {
        connect(): Promise<{
          address: string;
          compressedPublicKey: string;
          publicKey: string;
        }>;
        disconnect(): Promise<void>;
        getAccounts(): Promise<string[]>;
        getBalance(): Promise<{
          confirmed: number;
          total: number;
          unconfirmed: number;
        }>;
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
