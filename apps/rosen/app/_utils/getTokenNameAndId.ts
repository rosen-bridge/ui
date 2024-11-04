import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORK_VALUES } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

/**
 * a utility to make unique interface for accessing token name
 */
export const getTokenNameAndId = (token: RosenChainToken, network: Network) => {
  if (NETWORK_VALUES.includes(network)) {
    return {
      tokenName: token.name,
      tokenId: token.tokenId,
    };
  }
};
