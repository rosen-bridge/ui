import { RosenAmount, TokenMap } from '@rosen-bridge/tokens';

import { generateUnsignedTx } from '../src';
import { getAdditionalBoxes } from '../src/utils';
import { fromAddress, internalPubkey, lockAddress, lockData } from './testData';

vi.mock('axios', async () => {
  const testData = await import('./testData');
  return {
    default: {
      get: vi
        .fn()
        .mockResolvedValueOnce({ status: 200, data: testData.runesBoxes[0] })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.availableBtcBoxes[0],
        })
        .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[0] })
        .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[1] })
        .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[2] }),
    },
  };
});

vi.mock('../src/constants', () => {
  return {
    SEGWIT_INPUT_WEIGHT_UNIT: 272,
    SEGWIT_OUTPUT_WEIGHT_UNIT: 124,
    CONFIRMATION_TARGET: 6,
    TAPROOT_INPUT_WEIGHT_UNIT: 230,
    TAPROOT_OUTPUT_WEIGHT_UNIT: 172,
    MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT: 294n,
    MINIMUM_BTC_FOR_TAPROOT_OUTPUT: 330n,
    GET_BOX_API_LIMIT: 2,
  };
});

vi.mock('../src/utils', async (importOriginal) => {
  const ref = await importOriginal<typeof import('../src/utils')>();
  const getAdditionalBoxes = vi.spyOn(ref, 'getAdditionalBoxes');

  return {
    ...ref,
    getAdditionalBoxes,
    getFeeRatio: async () => 1,
  };
});

describe('generateUnsignedTx', () => {
  /**
   * @target generateUnsignedTx should perform 3 selection steps to get the required amounts
   * @dependencies
   * @scenario
   * - stub requestUnisat to return mock sequence of responses
   * - spy on getAdditionalBoxes
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - generateUnsignedTx should resolve to a psbt object
   * - getAdditionalBoxes mock should have been called 2 times
   */
  it('should perform 3 selection steps to get the required amounts', async () => {
    // arrange
    const getTokenMap = async () =>
      ({
        unwrapAmount: vi.fn().mockImplementation(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (tokenId: string, amount: bigint, toChain: string): RosenAmount => {
            return { amount: 10n, decimals: 2 };
          },
        ),
      }) as unknown as TokenMap;

    // act
    const result = await generateUnsignedTx(getTokenMap)(
      lockAddress,
      fromAddress,
      100n,
      lockData,
      {
        tokenId: '880352:855',
        name: 'TESTINGCATAETCH',
        decimals: 2,
        type: 'type',
        residency: 'wrapped',
        extra: {},
      },
      internalPubkey,
    );

    // assert
    expect(result.inputSize).toBe(2);
    expect(getAdditionalBoxes).toHaveBeenCalledTimes(2);
  });
});
