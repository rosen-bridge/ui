'use server';

import { Address } from 'ergo-lib-wasm-nodejs';
import { Networks } from '@/_constants';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
export const validateAddress = (
  chain: keyof typeof Networks,
  walletAddress: string,
) => {
  try {
    if (chain === Networks.ergo) {
      Address.from_base58(walletAddress);
    } else if (chain === Networks.cardano) {
      wasm.Address.from_bech32(walletAddress);
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid Address' };
  }
};
