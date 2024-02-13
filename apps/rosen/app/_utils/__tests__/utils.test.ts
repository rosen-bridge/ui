import { describe, expect, test } from 'vitest';

import { getTokenNameAndId } from '../index';

import { Networks } from '@/_constants';

/**
 * @target getTokenNameAndId function it should return
 * an objet containing the token name and token id given different networks
 *
 * @dependencies
 * - Networks
 * - RosenChainToken
 *
 * @scenario
 * - loop over all the supported network
 * - create a test token with fake data
 * - send the test token to the function and check the results
 *
 * @expected
 * - it should return an object that contains a tokeId and tokenName
 */

describe('rosen-app utils tests', () => {
  test('it should return an objet containing the token name and token id given different networks', () => {
    Object.values(Networks).forEach((network, index) => {
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
