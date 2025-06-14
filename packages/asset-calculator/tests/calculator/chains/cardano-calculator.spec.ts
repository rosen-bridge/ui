/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenMap } from '@rosen-bridge/tokens';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

import { CardanoCalculator } from '../../../lib/calculator/chains/cardano-calculator';
import { tokenMapData } from '../../test-data';

vitest.mock('@rosen-clients/cardano-koios');

describe('CardanoCalculator', () => {
  describe('totalBalance', () => {
    /**
     * Mock return value of koios address assets
     */
    beforeEach(() => {
      vitest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        addressAssets: async () => [
          {
            address: 'hotAddress',
            policy_id: 'policyId',
            asset_name: 'assetName',
            quantity: '100',
          },
          {
            address: 'hotAddress',
            policy_id: 'policyId',
            asset_name: 'assetName2',
            quantity: '200',
          },
          {
            address: 'coldAddress',
            policy_id: 'policyId',
            asset_name: 'assetName',
            quantity: '300',
          },
          {
            address: 'coldAddress',
            policy_id: 'policyId2',
            asset_name: 'assetName',
            quantity: '400',
          },
        ],
      } as any);
    });

    /**
     * @target CardanoCalculator.totalBalance should calculate the token balance using koios api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - create new instance of CardanoCalculator
     * - call test for mocked token (totalBalance)
     * @expected
     * - The token balance should be calculated 400 since it checks two addresses with 100 and 300 balance
     */
    it('should calculate the token balance using koios api', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      const cardanoCalculator = new CardanoCalculator(
        tokenMap,
        ['hotAddress', 'coldAddress'],
        'authToken',
      );
      const totalBalance = await cardanoCalculator.totalBalance({
        extra: {
          policyId: 'policyId',
          assetName: 'assetName',
        },
      } as any);
      expect(totalBalance).toEqual(400n);
    });
  });

  describe('totalSupply', () => {
    /**
     * Mock return value of koios token information
     */
    beforeEach(() => {
      vitest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        assetInfo: async () => [
          {
            policy_id: 'policyId',
            asset_name: 'assetName',
            total_supply: '20000',
          },
        ],
      } as any);
    });

    /**
     * @target CardanoCalculator.totalSupply should calculate the token balance using koios api
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - create new instance of CardanoCalculator
     * - call test for mocked token (totalSupply)
     * @expected
     * - The token balance should be calculated 20000
     */
    it('should calculate the token balance using koios api', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      const cardanoCalculator = new CardanoCalculator(
        tokenMap,
        ['hotAddress', 'coldAddress'],
        'authToken',
      );
      const totalBalance = await cardanoCalculator.totalSupply({
        extra: {
          policyId: 'policyId',
          name: 'assetName',
        },
      } as any);
      expect(totalBalance).toEqual(20000n);
    });
  });
});
