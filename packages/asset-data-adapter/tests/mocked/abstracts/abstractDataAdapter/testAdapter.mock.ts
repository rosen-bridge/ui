import { NETWORKS } from '@rosen-ui/constants';

import { AbstractDataAdapter } from '../../../../lib/abstracts/abstractDataAdapter';
import { ChainAssetBalance } from '../../../../lib/types';

export class TestAdapter extends AbstractDataAdapter {
  chain = NETWORKS.ergo.key;

  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    if (address === 'addr1') {
      return [
        { assetId: 'token0', balance: 100n },
        { assetId: 'token1', balance: 100n },
        { assetId: 'ergo_token2', balance: 200_000n },
        { assetId: 'cardano_token3', balance: 200_000n },
        // tokens by zero amount must ignore in results
        { assetId: 'zero_token', balance: 0n },
      ];
    }
    if (address === 'addr2') {
      return [
        { assetId: 'token0', balance: 300n },
        { assetId: 'token1', balance: 50n },
        // tokens by zero amount must ignore in results
        { assetId: 'zero_token', balance: 0n },
      ];
    }
    return [];
  };

  getRawTotalSupply = async () => {
    return 5000n;
  };
}
