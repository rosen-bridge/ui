import { describe, expect, it } from 'vitest';

import { getTokenNameAndId } from '@/_utils';

import { NETWORKS, NETWORK_VALUES } from '@rosen-ui/constants';

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
    NETWORK_VALUES.forEach((network, index) => {
      /**
       * TODO: remove it after fixing the typing in network
       * local:ergo/rosen-bridge/ui#311
       */
      if (network == NETWORKS.ETHEREUM) return;

      const testToken = {
        name: 'test-' + network,
        tokenId: '123456' + index,
        decimals: 2,
        metaData: {
          type: network,
          residency: '',
        },
      };

      expect(getTokenNameAndId(testToken, network)).toEqual({
        tokenName: testToken.name,
        tokenId: testToken.tokenId,
      });
    });
  });
});
