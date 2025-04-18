import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateUnsignedTx,
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from '@rosen-network/doge';

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
