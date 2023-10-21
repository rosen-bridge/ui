'use server';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import { decodeWasmValue } from '@rosen-ui/wallet-api';

import { getDecimalString } from '@rosen-ui/utils';

const CardanoSerializationLib = require('@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib');

/**
 * search the wallet and return the balance for
 * the requested token
 */

export const getBalance = async (token: RosenChainToken, value: string) => {
  const tokenTyped = token as any;
  const balances = decodeWasmValue(value, CardanoSerializationLib);

  const amount = balances.find(
    (asset) => asset.policyId === tokenTyped.policyId,
  );

  return amount
    ? Number(getDecimalString(amount.quantity.toString(), tokenTyped.decimals))
    : 0;
  return 2;
};
