'use server';

import { validateAddress as validate } from '@rosen-bridge/address-codec';
import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import Joi from 'joi';

import { wrap } from '@/safeServerAction';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
const validateAddressCore = async (chain: Network, walletAddress: string) => {
  try {
    return validate(chain, walletAddress);
  } catch {
    return false;
  }
};

type Schema = Parameters<typeof validateAddressCore>;

const schema = Joi.array<Schema>().ordered(
  Joi.string()
    .required()
    .valid(...NETWORKS_KEYS),
  Joi.string().required(),
);

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'validateAddress',
  schema,
});
