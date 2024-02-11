import { expect, test } from 'vitest';

import { getTokenNameAndId } from '../index';

import { Networks } from '@/_constants';

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
