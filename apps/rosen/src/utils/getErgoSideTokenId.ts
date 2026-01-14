import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';

/**
 * Returns the Ergo-side token ID for a given token id.
 *
 * @param tokenMap
 * @param id
 */
export const getErgoSideTokenId = (
  tokenMap: TokenMap,
  id?: string,
): string | undefined => {
  if (!id) return;
  return tokenMap.getTokenSet(id)?.[NETWORKS.ergo.key]?.tokenId;
};
