import { RosenChainToken } from '@rosen-bridge/tokens';
import { encode } from 'cbor-x';

import { getNamiWallet } from './getNamiWallet';
import { NamiWalletCreator } from './types';

// TODO
const hexToCbor = (hex: string) =>
  Buffer.from(encode(Buffer.from(hex, 'hex'))).toString('hex');

export const getBalanceCreator =
  (config: NamiWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getNamiWallet().api.enable();
    const rawValue = await context.getBalance();
    const balances = await config.decodeWasmValue(rawValue);

    const amount = balances.find(
      (asset) =>
        asset.policyId === token.policyId &&
        (asset.nameHex === hexToCbor(token.assetName) || !token.policyId)
    );
    return amount ? Number(amount.quantity) : 0;
  };
