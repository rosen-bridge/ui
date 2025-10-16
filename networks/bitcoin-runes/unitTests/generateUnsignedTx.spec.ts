import { BitcoinRunesBoxSelection } from '@rosen-bridge/bitcoin-runes-utxo-selection';
import { TokenMap } from '@rosen-bridge/tokens';
import { Mock } from 'vitest';

import { generateUnsignedTx } from '../src';
import { getAdditionalBoxes } from '../src/utils';
import * as testData from './testData';

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

vi.mock(import('@rosen-bridge/bitcoin-runes-utxo-selection'), () => {
  const BitcoinRunesBoxSelection = vi.fn();
  BitcoinRunesBoxSelection.prototype.getCoveringBoxes = vi.fn();
  return { BitcoinRunesBoxSelection };
});

describe('generateUnsignedTx', () => {
  const getCoveringBoxesMock = BitcoinRunesBoxSelection.prototype
    .getCoveringBoxes as Mock;

  beforeEach(() => {
    (getAdditionalBoxes as Mock).mockClear();
    getCoveringBoxesMock.mockClear();
  });

  /**
   * @target generateUnsignedTx should perform 1 selection step to get the required amounts
   * @dependencies
   * - TokenMap
   * - BitcoinRunesBoxSelection
   * @scenario
   * - stub getCoveringBoxes to resolve to a mock object that covers the required amount
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
    getCoveringBoxesMock.mockResolvedValueOnce(testData.selection1[0]);

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
   * - TokenMap
   * - BitcoinRunesBoxSelection
   * @scenario
   * - stub getCoveringBoxes to resolve to sequence of mock objects that covers the required
   *  amount on the second call
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
    getCoveringBoxesMock
      .mockResolvedValueOnce(testData.selection2[0])
      .mockResolvedValueOnce(testData.selection2[1]);

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
   * - TokenMap
   * - BitcoinRunesBoxSelection
   * @scenario
   * - stub getCoveringBoxes to resolve to sequence of mock objects that covers the required
   *  amount on the third call
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
    getCoveringBoxesMock
      .mockResolvedValueOnce(testData.selection3[0])
      .mockResolvedValueOnce(testData.selection3[1])
      .mockResolvedValueOnce(testData.selection3[2]);

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
