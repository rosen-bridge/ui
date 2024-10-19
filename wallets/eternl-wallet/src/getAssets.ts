import { WalletCreatorConfig } from '@rosen-network/cardano';
import { getEternlWallet } from './getEternlWallet';

export const getAssets =
  (config: WalletCreatorConfig) => async (): Promise<string[]> => {
    const context = await getEternlWallet().getApi().enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);
    const tokens = balances.map((balance) => balance.name);
    return tokens;
  };
