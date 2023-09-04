'use server';

import { Address } from 'ergo-lib-wasm-nodejs';

export const AddressValidator = (walletAddress: string) => {
  try {
    Address.from_base58(walletAddress);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Invalid Address' };
  }
};
