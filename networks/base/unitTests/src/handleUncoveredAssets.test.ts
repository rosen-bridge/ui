import type { AssetBalance } from '@rosen-bridge/selection-types';
import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { describe, it, expect } from 'vitest';

import {
  handleUncoveredAssets,
  InsufficientAssetsError,
} from '../../src/handleUncoveredAssets';
import { testTokenMap } from '../test-data';

const getTokenMap = async () => {
  const tokenMap = new TokenMap();
  await tokenMap.updateConfigByJson(testTokenMap);
  return tokenMap;
};

describe('handleUncoveredAssets', () => {
  /**
   * @target handleUncoveredAssets should throw InsufficientAssetsError with native token only
   * @dependencies
   * - TokenMap properly initialized from test data
   * - NETWORKS.ergo.key representing the native chain
   * @scenario
   * - Provide a non-zero native token balance and no additional tokens
   * - Call handleUncoveredAssets with these values
   * - Catch and validate the thrown InsufficientAssetsError
   * @expected
   * - Should throw InsufficientAssetsError
   * - error.message should contain '123.45 ERG'
   */
  it('should throw InsufficientAssetsError with native token only', async () => {
    const tokenMap = await getTokenMap();

    const assetBalance: AssetBalance = {
      nativeToken: 12345n,
      tokens: [],
    };

    expect(() =>
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance),
    ).toThrowError(InsufficientAssetsError);

    try {
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance);
    } catch (error) {
      expect(error).toBeInstanceOf(InsufficientAssetsError);

      const message = (error as InsufficientAssetsError).message;

      expect(message).toContain('123.45 ERG');
    }
  });

  /**
   * @target handleUncoveredAssets should throw InsufficientAssetsError with only custom tokens
   * @dependencies
   * - TokenMap with a registered test token (id: test-token-id-1)
   * - NETWORKS.ergo.key for context
   * @scenario
   * - Provide 0 native balance and one custom token with non-zero value
   * - Call handleUncoveredAssets
   * - Expect the correct token name and amount in the error
   * @expected
   * - Should throw InsufficientAssetsError
   * - error.message should contain '543.21 test token 1'
   */
  it('should throw InsufficientAssetsError with custom tokens only', async () => {
    const tokenMap = await getTokenMap();

    const assetBalance: AssetBalance = {
      nativeToken: 0n,
      tokens: [
        {
          id: 'test-token-id-1',
          value: 54321n,
        },
      ],
    };

    expect(() =>
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance),
    ).toThrowError(InsufficientAssetsError);

    try {
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance);
    } catch (error) {
      expect(error).toBeInstanceOf(InsufficientAssetsError);

      const message = (error as InsufficientAssetsError).message;

      expect(message).toContain('543.21 test token 1');
    }
  });

  /**
   * @target handleUncoveredAssets should throw InsufficientAssetsError with multiple tokens
   * @dependencies
   * - TokenMap with both native and custom tokens registered
   * @scenario
   * - Provide both a non-zero native token and a custom token
   * - Call handleUncoveredAssets
   * - Catch and verify error structure and formatted message
   * @expected
   * - Should throw InsufficientAssetsError
   * - error.message should contain '123.45 ERG and 543.21 test token 1'
   */
  it('should throw InsufficientAssetsError with multiple tokens', async () => {
    const tokenMap = await getTokenMap();

    const assetBalance: AssetBalance = {
      nativeToken: 12345n,
      tokens: [
        {
          id: 'test-token-id-1',
          value: 54321n,
        },
      ],
    };

    expect(() =>
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance),
    ).toThrowError(InsufficientAssetsError);

    try {
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance);
    } catch (error) {
      expect(error).toBeInstanceOf(InsufficientAssetsError);

      const message = (error as InsufficientAssetsError).message;

      expect(message).toContain('123.45 ERG and 543.21 test token 1');
    }
  });

  /**
   * @target handleUncoveredAssets should throw Error when no asset values are provided
   * @dependencies
   * - TokenMap with normal configuration
   * @scenario
   * - Provide 0n for native token and empty tokens list
   * - Call handleUncoveredAssets
   * - Also call handleUncoveredAssets with assetBalance = undefined
   * @expected
   * - Should throw Error with message 'Unexpected Error'
   */
  it('should throw Error when no asset values are provided', async () => {
    const tokenMap = await getTokenMap();

    const assetBalance: AssetBalance = {
      nativeToken: 0n,
      tokens: [],
    };

    expect(() =>
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key, assetBalance),
    ).toThrowError('Unexpected Error');

    expect(() =>
      handleUncoveredAssets(tokenMap, NETWORKS.ergo.key),
    ).toThrowError('Unexpected Error');
  });
});
