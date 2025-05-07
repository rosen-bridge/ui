import type {
  generateUnsignedTx,
  decodeWasmValue,
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from '@rosen-network/cardano';
import { CipWalletApi, WalletConfig } from '@rosen-ui/wallet-api';

export type EtrnlWalletConfig = WalletConfig & {
  decodeWasmValue: typeof decodeWasmValue;
  generateLockAuxiliaryData: typeof generateLockAuxiliaryData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  setTxWitnessSet: typeof setTxWitnessSet;
};

/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    cardano: {
      eternl: {
        enable: () => Promise<CipWalletApi>;
        isEnabled: () => Promise<boolean>;
        experimental?: unknown;
      };
    };
  }
}
