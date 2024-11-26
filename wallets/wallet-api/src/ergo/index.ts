import type { RosenChainToken } from '@rosen-bridge/tokens';

import { Address, AssetName } from '../types';

/**
 * ergo token info
 */
export interface ErgoToken extends RosenChainToken {
  tokenId: Address;
  tokenName: AssetName;
  decimals: number;
}
