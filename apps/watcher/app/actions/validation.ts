'use server';

import { validateAddress as validate } from '@rosen-bridge/address-codec';
import { NETWORKS } from '@rosen-ui/constants';

export const validateAddressErgo = async (walletAddress: string) => {
  try {
    return validate(NETWORKS.ergo.key, walletAddress);
  } catch {
    return false;
  }
};
