'use server';

import { Address } from 'ergo-lib-wasm-nodejs';
import { Networks } from '@rosen-ui/constants';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { AvailableNetworks } from '@/_networks';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
export const validateAddress = (
  chain: AvailableNetworks,
  walletAddress: string,
) => {
  try {
    if (chain === Networks.ERGO) {
      Address.from_base58(walletAddress);
    } else if (chain === Networks.CARDANO) {
      wasm.Address.from_bech32(walletAddress);
    }
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid Address' };
  }
};
