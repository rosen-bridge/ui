'use server';

import { Address } from 'ergo-lib-wasm-nodejs';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results fort the passed address
 */
export const AddressValidator = (walletAddress: string) => {
  try {
    Address.from_base58(walletAddress);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid Address' };
  }
};
