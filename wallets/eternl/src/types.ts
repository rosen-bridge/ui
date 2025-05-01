import { TokenMap } from '@rosen-bridge/tokens';
import type {
  generateUnsignedTx,
  decodeWasmValue,
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from '@rosen-network/cardano';
import { CipWalletApi } from '@rosen-ui/wallet-api';

export type WalletConfig = {
  getTokenMap: () => Promise<TokenMap>;
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
