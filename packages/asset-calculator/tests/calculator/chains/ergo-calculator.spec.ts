/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vitest } from 'vitest';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import { ErgoCalculator } from '../../../lib/calculator/chains/ergo-calculator';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ErgoCalculator', () => {
  describe('totalBalance', () => {
    /**
     * Mock return value of explorer address total balance
     */
    beforeEach(() => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1AddressesP1BalanceConfirmed: async () => ({
            tokens: [{ tokenId: 'tokenId', amount: 1200n }],
            nanoErgs: 120000n,
          }),
        },
      } as any);
    });

    /**
     * @target ErgoCalculator.totalBalance should calculate the token balance using explorer api
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoCalculator
     * - call test for mocked token (totalBalance)
     * @expected
     * - The token balance should be calculated 2400 since it checks two addresses with 1200 balance each
     */
    it('should calculate the token balance using explorer api', async () => {
      const ergoCalculator = new ErgoCalculator(
        ['hotAddress', 'coldAddress'],
        'explorerUrl'
      );
      const totalBalance = await ergoCalculator.totalBalance({
        tokenId: 'tokenId',
      } as any);
      expect(totalBalance).to.equal(2400n);
    });
  });

  describe('totalBalance', () => {
    /**
     * Mock return value of explorer token information
     */
    beforeEach(() => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1TokensP1: async () => ({
            id: 'tokenId',
            emissionAmount: 20000n,
          }),
        },
      } as any);
    });

    /**
     * @target ErgoCalculator.totalSupply should calculate the token balance using explorer api
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - create new instance of ErgoCalculator
     * - call test for mocked token (totalSupply)
     * @expected
     * - The token balance should be calculated 20000
     */
    it('should calculate the token balance using explorer api', async () => {
      const ergoCalculator = new ErgoCalculator(
        ['hotAddress', 'coldAddress'],
        'explorerUrl'
      );
      const totalBalance = await ergoCalculator.totalSupply({
        tokenId: 'tokenId',
      } as any);
      expect(totalBalance).to.equal(20000n);
    });
  });
});
