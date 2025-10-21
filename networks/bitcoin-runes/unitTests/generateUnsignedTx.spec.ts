import { BitcoinRunesBoxSelection } from '@rosen-bridge/bitcoin-runes-utxo-selection';
import { TokenMap } from '@rosen-bridge/tokens';
import { Mock } from 'vitest';

import { generateUnsignedTx } from '../src';
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

  return {
    ...ref,
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
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 1
   * - getCoveringBoxesMock mock should have been called once
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
    expect(getCoveringBoxesMock).toHaveBeenCalledTimes(1);
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
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 2
   * - getCoveringBoxesMock mock should have been called 2 times
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
    expect(getCoveringBoxesMock).toHaveBeenCalledTimes(2);
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
   * - call generateUnsignedTx
   * - check the returned psbt
   * @expected
   * - returning inputSize should have been 2
   * - getCoveringBoxesMock mock should have been called 3 times
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
    expect(getCoveringBoxesMock).toHaveBeenCalledTimes(3);
  });

  /**
   * @target generateUnsignedTx should throw when user does not have enough runes for transfer
   * @dependencies
   * - TokenMap
   * - BitcoinRunesBoxSelection
   * @scenario
   * - stub getCoveringBoxes to resolve to a mock object that does
   *   not cover the required runes amount
   * - stub constants to return a mock value for GET_BOX_API_LIMIT
   * - stub tokenMap.unwrapAmount to return a mock value
   * - call generateUnsignedTx
   * @expected
   * - generateUnsignedTx should throw
   */
  it('should throw when user does not have enough runes for transfer', async () => {
    // arrange
    getCoveringBoxesMock.mockResolvedValueOnce(testData.selection4[0]);

    const getTokenMap = async () =>
      ({
        unwrapAmount: vi
          .fn()
          .mockImplementation(() => ({ amount: 1000n, decimals: 2 })),
      }) as unknown as TokenMap;

    // act and assert
    await expect(async () => {
      await generateUnsignedTx(getTokenMap)(
        testData.lockAddress,
        testData.fromAddress,
        1000n,
        testData.lockData,
        testData.transferToken,
        testData.internalPubkey,
      );
    }).rejects.toThrow();
  });

  /**
   * @target generateUnsignedTx should throw when user does not have enough btc for transfer
   * @dependencies
   * - TokenMap
   * - BitcoinRunesBoxSelection
   * @scenario
   * - stub getCoveringBoxes to resolve to sequence of mock objects
   *   that does not cover the required btc amount
   * - stub constants to return a mock value for GET_BOX_API_LIMIT
   * - stub tokenMap.unwrapAmount to return a mock value
   * - call generateUnsignedTx
   * @expected
   * - generateUnsignedTx should throw
   */
  it('should throw when user does not have enough btc for transfer', async () => {
    // arrange
    getCoveringBoxesMock
      .mockResolvedValueOnce(testData.selection5[0])
      .mockResolvedValueOnce(testData.selection5[1])
      .mockResolvedValueOnce(testData.selection5[2]);

    const getTokenMap = async () =>
      ({
        unwrapAmount: vi
          .fn()
          .mockImplementation(() => ({ amount: 10n, decimals: 2 })),
      }) as unknown as TokenMap;

    // act and assert
    await expect(async () => {
      await generateUnsignedTx(getTokenMap)(
        testData.lockAddress,
        testData.fromAddress,
        10n,
        testData.lockData,
        testData.transferToken,
        testData.internalPubkey,
      );
    }).rejects.toThrow();
  });
});
