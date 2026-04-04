import { WalletConfig } from '@rosen-ui/wallet-api';

export type FiroWalletConfig = WalletConfig & {};

/**
 * global type augmentation for the firo wallet
 */
declare global {
  interface Window {
    firo: {
      connect: () => Promise<{
        approved: boolean;
        address: string;
        balance: string;
        publicKey: string;
      }>;
      disconnect: () => Promise<{ disconnected: true }>;
      signAndBroadcastTransaction: (params: {
        rawTx: string;
        indexes: number[];
        signOnly: boolean;
      }) => Promise<string>;
      getBalance: () => Promise<{
        address: string;
        balance: string;
      }>;
      getConnectionStatus: () => Promise<{
        isConnected: boolean;
        selectedWalletAddress: string;
      }>;
    };
  }
}
