import axios from 'axios';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';

import {
  getAddressAllBtcUtxos,
  getAddressAvailableBtcUtxos,
  getAddressRunesUtxos,
} from '../src/utils';
import * as testData from './testData';

vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('utils', () => {
  const axiosMock = axios.get as Mock;

  beforeEach(() => {
    axiosMock.mockClear();
  });

  describe('getAddressAvailableBtcUtxos', () => {
    /**
     * @target getAddressAvailableBtcUtxos should successfully get all the pages
     * @dependencies
     * - axios
     * @scenario
     * - stub axios.get to return mock sequence of responses
     * - call getAddressAvailableBtcUtxos
     * - collect the returned utxos
     * @expected
     * - 4 utxos should have been returned
     * - axiosMock should have been called 3 times
     */
    it('should successfully get all the pages', async () => {
      // arrange
      axiosMock
        .mockResolvedValueOnce({
          status: 200,
          data: testData.availableBtcBoxes[0],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.availableBtcBoxes[1],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.availableBtcBoxes[2],
        });

      // act
      const utxoIterator = getAddressAvailableBtcUtxos(
        testData.lockAddress,
        0,
        2,
      );

      const results = [];
      for await (const utxo of utxoIterator) {
        results.push(utxo);
      }

      // assert
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.txId)).toEqual([
        testData.availableBtcBoxes[0].data.utxo[0].txid,
        testData.availableBtcBoxes[0].data.utxo[1].txid,
        testData.availableBtcBoxes[1].data.utxo[0].txid,
        testData.availableBtcBoxes[1].data.utxo[1].txid,
      ]);
      expect(axiosMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAddressAllBtcUtxos', () => {
    /**
     * @target getAddressAllBtcUtxos should successfully get all the pages
     * @dependencies
     * - axios
     * @scenario
     * - stub axios.get to return mock sequence of responses
     * - call getAddressAllBtcUtxos
     * - collect the returned utxos
     * @expected
     * - 4 utxos should have been returned
     * - axiosMock should have been called 3 times
     */
    it('should successfully get all the pages', async () => {
      // arrange
      axiosMock
        .mockResolvedValueOnce({
          status: 200,
          data: testData.allBtcBoxes[0],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.allBtcBoxes[1],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.allBtcBoxes[2],
        });

      // act
      const utxoIterator = getAddressAllBtcUtxos(testData.lockAddress, 0, 2);

      const results = [];
      for await (const utxo of utxoIterator) {
        results.push(utxo);
      }

      // assert
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.txId)).toEqual([
        testData.allBtcBoxes[0].data.utxo[0].txid,
        testData.allBtcBoxes[0].data.utxo[1].txid,
        testData.allBtcBoxes[1].data.utxo[0].txid,
        testData.allBtcBoxes[1].data.utxo[1].txid,
      ]);
      expect(axiosMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAddressRunesUtxos', () => {
    /**
     * @target getAddressRunesUtxos should successfully get all the pages
     * @dependencies
     * - axios
     * @scenario
     * - stub axios.get to return mock sequence of responses
     * - call getAddressRunesUtxos
     * - collect the returned utxos
     * @expected
     * - 4 utxos should have been returned
     * - axiosMock should have been called 3 times
     */
    it('should successfully get all the pages', async () => {
      // arrange
      axiosMock
        .mockResolvedValueOnce({
          status: 200,
          data: testData.runesBoxes[0],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.runesBoxes[1],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: testData.runesBoxes[2],
        });

      // act
      const utxoIterator = getAddressRunesUtxos(
        testData.lockAddress,
        'ROSENPOCRUNE',
        0,
        2,
      );

      const results = [];
      for await (const utxo of utxoIterator) {
        results.push(utxo);
      }

      // assert
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.txId)).toEqual([
        testData.runesBoxes[0].data.utxo[0].txid,
        testData.runesBoxes[0].data.utxo[1].txid,
        testData.runesBoxes[1].data.utxo[0].txid,
        testData.runesBoxes[1].data.utxo[1].txid,
      ]);
      expect(axiosMock).toHaveBeenCalledTimes(3);
    });
  });
});
