'use server';

import { NETWORK_VALUES } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { withValidation } from '@/_validation';
import { wrap } from '@/_errors';
import Joi from 'joi';
import { validateAddress as validate } from '@rosen-bridge/address-codec';

/**
 * server action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
const validateAddressCore = async (chain: Network, walletAddress: string) =>
  validate(chain, walletAddress);

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
