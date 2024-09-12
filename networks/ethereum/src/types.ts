import { TokenMap } from '@rosen-bridge/tokens';
import { Wallet } from '@rosen-ui/wallet-api';

export type WalletCreator = (config: WalletCreatorConfig) => Wallet;

export type WalletCreatorConfig = {
  getTokenMap(): Promise<TokenMap>;
};
