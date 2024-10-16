import { TokenMap } from '@rosen-bridge/tokens';
import { CipWalletApi, Wallet } from '@rosen-ui/wallet-api';

import { generateUnsignedTx } from './generateUnsignedTx';
import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from './utils';

export interface CardanoProtocolParams {
  min_fee_a: number;
  min_fee_b: number;
  pool_deposit: string;
  key_deposit: string;
  max_value_size: number;
  max_tx_size: number;
  coins_per_utxo_size: string;
}

export const ADA_POLICY_ID = '';

export type WalletCreator = (config: WalletCreatorConfig) => Wallet;

export type WalletCreatorConfig = {
  getTokenMap(): Promise<TokenMap>;
  decodeWasmValue: typeof decodeWasmValue;
  generateLockAuxiliaryData: typeof generateLockAuxiliaryData;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
  setTxWitnessSet: typeof setTxWitnessSet;
};

export interface ConnectorAPI {
  enable(): Promise<CipWalletApi>;
  isEnabled(): Promise<boolean>;
  experimental?: unknown;
}

/**
 * global type augmentation for wallets
 */
declare global {
  let cardano: { [key: string]: ConnectorAPI };
}
