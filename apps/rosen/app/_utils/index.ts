import { decodeHex } from '@rosen-ui/utils';
import { RosenChainToken } from '@rosen-bridge/tokens';

import { Networks } from '@/_constants';

/**
 * a utility to convert hexString to string
 * @param hex - hex string
 * @returns - parsed string
 */
export const hexToString = (hex: string) => {
  if (!hex) return '';

  return new TextDecoder().decode(decodeHex(hex));
};

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (
  token: RosenChainToken,
  network: keyof typeof Networks,
) => {
  if (network === Networks.ergo) {
    return {
      tokenName: token.name,
      tokenId: token.tokenId,
    };
  } else if (network === Networks.cardano) {
    return {
      tokenName: token.name,
      tokenId: token.fingerprint,
    };
  }
};
