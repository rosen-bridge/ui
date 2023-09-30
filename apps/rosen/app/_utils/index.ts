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
      tokenName: token.tokenName,
      tokenId: token.tokenId,
    };
  } else if (network === Networks.cardano) {
    return {
      tokenName: hexToString(token.assetName),
      tokenId: token.fingerprint,
    };
  }
};

/**
 * gets a list of bigint values and returns the largest value
 *
 * @param args
 * @returns - maximum number
 */
const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m));
