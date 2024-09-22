'use server';

import { Address } from 'ergo-lib-wasm-nodejs';
import { NETWORKS, NETWORK_VALUES } from '@rosen-ui/constants';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { Network } from '@rosen-ui/types';
import { isValidAddress as isValidBitcoinAddress } from '@rosen-network/bitcoin';
import { isValidAddress as isValidEthereumAddress } from '@rosen-network/ethereum';
import { withValidation } from '@/_validation';
import { wrap } from '@/_errors';
import Joi from 'joi';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
const validateAddressCore = async (chain: Network, walletAddress: string) => {
  try {
    if (chain === NETWORKS.ERGO) {
      Address.from_base58(walletAddress);
    } else if (chain === NETWORKS.CARDANO) {
      wasm.Address.from_bech32(walletAddress);
    } else if (chain == NETWORKS.BITCOIN) {
      if (!isValidBitcoinAddress(walletAddress)) {
        throw new Error();
      }
    } else if (chain == NETWORKS.ETHEREUM) {
      if (!isValidEthereumAddress(walletAddress)) {
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
    .valid(...NETWORK_VALUES),
  Joi.string().required(),
);

export const validateAddress = wrap(
  withValidation(schema, validateAddressCore),
);
