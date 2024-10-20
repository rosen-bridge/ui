import { TokenMap } from '@rosen-bridge/tokens';
import { EipWalletApi, ErgoBoxProxy, Wallet } from '@rosen-ui/wallet-api';

import { generateUnsignedTx } from './generateUnsignedTx';

export interface TokenInfo {
  id: string;
  value: bigint;
}

export interface AssetBalance {
  nativeToken: bigint;
  tokens: Array<TokenInfo>;
}

export interface BoxInfo {
  id: string;
  assets: AssetBalance;
}

export interface CoveringBoxes {
  covered: boolean;
  boxes: Array<ErgoBoxProxy>;
}

export type WalletCreator = (config: WalletCreatorConfig) => Wallet;

export type WalletCreatorConfig = {
  getTokenMap(): Promise<TokenMap>;
  generateUnsignedTx: ReturnType<typeof generateUnsignedTx>;
};

/**
 * global type augmentation for nautilus wallet
 */
declare global {
  let ergo: EipWalletApi;
}
