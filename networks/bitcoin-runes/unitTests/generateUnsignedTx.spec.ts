import { TokenMap } from '@rosen-bridge/tokens';
import axios from 'axios';
import { Mock } from 'vitest';

import { generateUnsignedTx } from '../src';
import { getAdditionalBoxes } from '../src/utils';
import * as testData from './testData';

vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

vi.mock('../src/constants', async (importOriginal) => {
  const ref = await importOriginal<typeof import('../src/constants')>();

  return {
    ...ref,
    default: {
      GET_BOX_API_LIMIT: 2,
    },
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
  beforeEach(() => {
    (getAdditionalBoxes as Mock).mockClear();
    (axios.get as Mock).mockClear();
  });

  /**
   * @target generateUnsignedTx should perform 1 selection step to get the required amounts
   * @dependencies
   * @scenario
   * - stub axios.get to return mock sequence of responses
   * - stub constants to return a mock value for GET_BOX_API_LIMIT
   * - stub tokenMap.unwrapAmount to return a mock value
   * - spy on getAdditionalBoxes
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 1
   * - getAdditionalBoxes mock should not have been called
   */
  it('should perform 1 selection step to get the required amounts', async () => {
    // arrange
    (axios.get as Mock).mockResolvedValueOnce({
      status: 200,
      data: testData.runesBoxes2[0],
    });

    const getTokenMap = async () =>
      ({
        unwrapAmount: vi
          .fn()
          .mockImplementation(() => ({ amount: 10n, decimals: 2 })),
      }) as unknown as TokenMap;

    // act
    const result = await generateUnsignedTx(getTokenMap)(
      testData.lockAddress,
      testData.fromAddress,
      100n,
      testData.lockData,
      testData.transferToken,
      testData.internalPubkey,
    );

    // assert
    expect(result.inputSize).toBe(1);
    expect(getAdditionalBoxes).not.toHaveBeenCalled();
  });

  /**
   * @target generateUnsignedTx should perform 2 selection step to get the required amounts
   * @dependencies
   * @scenario
   * - stub axios.get to return mock sequence of responses
   * - stub constants to return a mock value for GET_BOX_API_LIMIT
   * - stub tokenMap.unwrapAmount to return a mock value
   * - spy on getAdditionalBoxes
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 2
   * - getAdditionalBoxes mock should have been called once
   */
  it('should perform 2 selection step to get the required amounts', async () => {
    // arrange
    (axios.get as Mock)
      .mockResolvedValueOnce({ status: 200, data: testData.runesBoxes[0] })
      .mockResolvedValueOnce({
        status: 200,
        data: testData.availableBtcBoxes2[0],
      });

    const getTokenMap = async () =>
      ({
        unwrapAmount: vi
          .fn()
          .mockImplementation(() => ({ amount: 10n, decimals: 2 })),
      }) as unknown as TokenMap;

    // act
    const result = await generateUnsignedTx(getTokenMap)(
      testData.lockAddress,
      testData.fromAddress,
      100n,
      testData.lockData,
      testData.transferToken,
      testData.internalPubkey,
    );

    // assert
    expect(result.inputSize).toBe(2);
    expect(getAdditionalBoxes).toHaveBeenCalledTimes(1);
  });

  /**
   * @target generateUnsignedTx should perform 3 selection steps to get the required amounts
   * @dependencies
   * @scenario
   * - stub axios.get to return mock sequence of responses
   * - stub constants to return a mock value for GET_BOX_API_LIMIT
   * - stub tokenMap.unwrapAmount to return a mock value
   * - spy on getAdditionalBoxes
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 2
   * - getAdditionalBoxes mock should have been called 2 times
   */
  it('should perform 3 selection steps to get the required amounts', async () => {
    // arrange
    (axios.get as Mock)
      .mockResolvedValueOnce({ status: 200, data: testData.runesBoxes[0] })
      .mockResolvedValueOnce({
        status: 200,
        data: testData.availableBtcBoxes[0],
      })
      .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[0] })
      .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[1] })
      .mockResolvedValueOnce({ status: 200, data: testData.allBtcBoxes[2] });

    const getTokenMap = async () =>
      ({
        unwrapAmount: vi
          .fn()
          .mockImplementation(() => ({ amount: 10n, decimals: 2 })),
      }) as unknown as TokenMap;

    // act
    const result = await generateUnsignedTx(getTokenMap)(
      testData.lockAddress,
      testData.fromAddress,
      100n,
      testData.lockData,
      testData.transferToken,
      testData.internalPubkey,
    );

    // assert
    expect(result.inputSize).toBe(2);
    expect(getAdditionalBoxes).toHaveBeenCalledTimes(2);
  });
});
