import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { describe, expect, it } from 'vitest';

import { generateOpReturnData } from '../../src';

describe('generateOpReturnData', () => {
  /**
   * @target generateOpReturnData should generate OP_RETURN data successfully
   * @dependencies
   * @scenario
   * - run test
   * - check returned data
   * @expected
   * - first byte should be index of given chain in SUPPORTED_CHAINS list
   * - next 8 bytes should be given bridgeFee
   * - next 8 bytes should be given networkFee
   * - next byte should be encoded given address length (in hex)
   * - length of remaining bytes should be as expected
   * - remaining bytes should be encoded given address
   */
  it('should generate OP_RETURN data successfully', async () => {
    const toChain = NETWORKS.ergo.key;
    const toAddress = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
    const bridgeFee = '1968503938';
    const networkFee = '9842520';

    const result = await generateOpReturnData(
      toChain,
      toAddress,
      networkFee,
      bridgeFee,
    );

    expect(result).toEqual(
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
    );
  });

  /**
   * @target generateOpReturnData should throw error when toChain is not supported
   * @dependencies
   * @scenario
   * - run test and check thrown exception
   * @expected
   * - it should return Error
   */
  it('should throw error when toChain is not supported', async () => {
    const toChain = 'invalid-chain' as Network;
    const toAddress = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
    const bridgeFee = '1968503938';
    const networkFee = '9842520';

    await expect(async () => {
      await generateOpReturnData(toChain, toAddress, networkFee, bridgeFee);
    }).rejects.toThrow(Error);
  });
});
