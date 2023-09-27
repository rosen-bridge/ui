import {
  decodeWasmValue,
  RustModule,
  CradanoToken,
} from '@rosen-ui/wallet-api';
import type { RosenChainToken } from '@rosen-bridge/tokens';

import { getDecimalString } from '@rosen-ui/utils';

export const getBalance = async (token: RosenChainToken) => {
  const tokenTyped = token as CradanoToken;
  const context = await cardano.nami.enable();
  const wasmLoader = await RustModule.load();

  const value = await context.getBalance();
  const balances = decodeWasmValue(value, wasmLoader);

  const amount = balances.find(
    (asset) => asset.policyId === tokenTyped.policyId
  );

  return amount
    ? Number(getDecimalString(amount.quantity.toString(), tokenTyped.decimals))
    : 0;
};
