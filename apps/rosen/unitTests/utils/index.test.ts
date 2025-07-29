import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { describe, expect, it } from 'vitest';

import { getTokenNameAndId } from '@/utils/getTokenNameAndId';

describe('getTokenNameAndId', () => {
  /**
   * @target getTokenNameAndId function it should return
   * an objet containing the token name and token id given different networks
   *
   * @dependencies
   *
   * @scenario
   * - loop over all the supported network
   * - create a test token with fake data
   * - send the test token to the function and check the results
   *
   * @expected
   * - it should return an object that contains a tokeId and tokenName
   */
  it('it should return an objet containing the token name and token id given different networks', () => {
    NETWORKS_KEYS.forEach((network, index) => {
      /**
       * TODO: remove it after fixing the typing in network
       * local:ergo/rosen-bridge/ui#311
       */
      if (network == NETWORKS.ethereum.key) return;

      const testToken = {
        name: 'test-' + network,
        tokenId: '123456' + index,
        decimals: 2,
        type: network,
        residency: '',
        extra: {},
      };

      expect(getTokenNameAndId(testToken, network)).toEqual({
        tokenName: testToken.name,
        tokenId: testToken.tokenId,
      });
    });
  });
});
