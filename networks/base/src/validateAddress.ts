import { validateAddress as validate } from '@rosen-bridge/address-codec';
import { Network } from '@rosen-ui/types';

/**
 * action to verify the wallet addresses
 * @param walletAddress - wallet address to verify
 * @returns the validation results for the passed address
 */
export const validateAddress = async (
  chain: Network,
  walletAddress: string,
) => {
  try {
    validate(chain, walletAddress);
    return true;
  } catch {
    return false;
  }
};
