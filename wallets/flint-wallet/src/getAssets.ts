import { WalletCreatorConfig } from '@rosen-network/cardano';
import { getFlintWallet } from './getFlintWallet';

export const getAssets =
  (config: WalletCreatorConfig) => async (): Promise<string[]> => {
    const context = await getFlintWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);
    const tokens = balances.map((balance) => balance.name);
    return tokens;
  };
