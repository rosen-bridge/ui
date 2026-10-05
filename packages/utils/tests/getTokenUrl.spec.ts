import { describe, expect, it } from 'vitest';

import { getTokenUrl } from '../src/getTokenUrl';

describe('getTokenUrl', () => {
  /**
   * @target getTokenUrl does not expose a BCH token explorer link
   * @dependencies Shared UI chain registry; no mocks.
   * @scenario Request a token link for native-only BCH and Ethereum.
   * @expected No BCH token link and an unchanged Etherscan token path.
   */
  it('does not expose a BCH token explorer link', () => {
    expect(getTokenUrl('bitcoin-cash', 'token')).toEqual(undefined);
    expect(getTokenUrl('ethereum', 'token')).toEqual('https://etherscan.io/token/token');
  });
});
