import { describe, expect, it } from 'vitest';
import { Networks } from '../../../../app/_constants';
import { generateOpReturnData } from '../../../../app/_networks/bitcoin/server';

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
    const toChain = Networks.ergo;
    const toAddress = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
    const bridgeFee = '1968503938';
    const networkFee = '9842520';

    const result = await generateOpReturnData(
      toChain,
      toAddress,
      networkFee,
      bridgeFee,
    );
    // result in hex: 00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339

    expect(result.slice(0, 2)).toEqual('00');
    expect(result.slice(2, 18)).toEqual('000000007554fc82');
    expect(result.slice(18, 34)).toEqual('0000000000962f58');
    expect(result.slice(34, 36)).toEqual('21'); // 33 bytes
    const encodedAddress = result.slice(36);
    expect(encodedAddress.length).toEqual(2 * 33); // 33 bytes, 66 characters in hex
    expect(encodedAddress).toEqual(
      '03f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
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
    const toChain = 'invalid-chain';
    const toAddress = '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd';
    const bridgeFee = '1968503938';
    const networkFee = '9842520';

    await expect(async () => {
      await generateOpReturnData(toChain, toAddress, networkFee, bridgeFee);
    }).rejects.toThrow(Error);
  });
});
