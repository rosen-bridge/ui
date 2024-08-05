'use server';

import { Address } from 'ergo-lib-wasm-nodejs';
import { Networks } from '@rosen-ui/constants';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { AvailableNetworks } from '@/_networks';
import { isValidAddress } from '@rosen-network/bitcoin';
import { withValidation } from '@/_validation';
import { wrap } from '@/_errors';
import Joi from 'joi';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
const validateAddressCore = async (
  chain: AvailableNetworks,
  walletAddress: string,
) => {
  try {
    if (chain === Networks.ERGO) {
      Address.from_base58(walletAddress);
    } else if (chain === Networks.CARDANO) {
      wasm.Address.from_bech32(walletAddress);
    } else if (chain == Networks.BITCOIN) {
      if (!isValidAddress(walletAddress)) {
        throw new Error();
      }
    }
    return true;
  } catch {
    return false;
  }
};

type Schema = Parameters<typeof validateAddressCore>;

const schema = Joi.array<Schema>().ordered(
  Joi.string()
    .required()
    .valid(Networks.BITCOIN, Networks.CARDANO, Networks.ERGO),
  Joi.string().required(),
);

export const validateAddress = wrap(
  withValidation(schema, validateAddressCore),
);
