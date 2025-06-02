import { WalletConfig } from '@rosen-ui/wallet-api';

export type MyDogeWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    doge: {
      connect: () => Promise<{
        approved: boolean;
        address: string;
        balance: string;
        publicKey: string;
      }>;
      disconnect: () => Promise<{ disconnected: true }>;
      requestPsbt: (params: {
        rawTx: string;
        indexes: number[];
        signOnly: boolean;
      }) => Promise<{
        txId: string;
      }>;
      getBalance: () => Promise<{
        address: string;
        balance: string;
      }>;
      getConnectionStatus: () => Promise<{
        connected: boolean;
        address: string;
        selectedWalletAddress: string;
      }>;
    };
  }
}
