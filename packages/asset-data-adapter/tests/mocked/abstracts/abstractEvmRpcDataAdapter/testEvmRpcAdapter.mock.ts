import { NETWORKS } from '@rosen-ui/constants';

import { AbstractEvmRpcDataAdapter, type ChainAssetBalance } from '../../../../lib';

export class TestEvmRpcAdapter extends AbstractEvmRpcDataAdapter {
  chain = NETWORKS.ethereum.key;

  getTotalAssets = (): { [address: string]: ChainAssetBalance[] } => this.totalAssets;

  setTotalAssets = (totalAssets: { [address: string]: ChainAssetBalance[] }) => {
    this.totalAssets = totalAssets;
  };

  callInitialize = (address: string) => this.initialize(address);

  callUpdateTokenBalance = (address: string, tokenId: string, balance: bigint) =>
    this.updateTokenBalance(address, tokenId, balance);

  callRemoveUnlistedAndAddNew = () => this.removeUnlistedAndAddNew();
}
