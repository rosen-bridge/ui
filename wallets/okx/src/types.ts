import { WalletConfig } from '@rosen-ui/wallet-api';

export type OKXWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    okxwallet: {
      selectedAddress?: string;
      bitcoin: {
        connect: () => Promise<{
          address: string;
          compressedPublicKey: string;
          publicKey: string;
        }>;
        disconnect: () => Promise<void>;
        getAccounts: () => Promise<string[]>;
        getBalance: () => Promise<{
          confirmed: number;
          total: number;
          unconfirmed: number;
        }>;
        signPsbt: (
          psbtHex: string,
          options: {
            autoFinalized: boolean;
            toSignInputs: { address: string; index: number }[];
          },
        ) => Promise<string>;
      };
    };
  }
}
