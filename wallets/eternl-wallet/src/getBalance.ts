import { RosenChainToken } from '@rosen-bridge/tokens';
import { decodeWasmValue } from '@rosen-ui/wallet-api';
import * as CardanoSerializationLib from '@emurgo/cardano-serialization-lib-nodejs';

import { getEternlWallet } from './getEternlWallet';
import { EternlWalletCreator } from './types';

export const getBalanceCreator =
  (config: EternlWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getEternlWallet().api.enable();
    const rawValue = await context.getBalance();
    const balances = await decodeWasmValue(rawValue, CardanoSerializationLib);

    const amount = balances.find((asset) => asset.policyId === token.policyId);
    return amount ? Number(amount.quantity) : 0;
  };
