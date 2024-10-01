import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

const baseTokenURLs: { [key in Network]: string } = {
  [NETWORKS.ERGO]: 'https://explorer.ergoplatform.com/en/token',
  [NETWORKS.CARDANO]: 'https://cardanoscan.io/token',
  [NETWORKS.BITCOIN]: '',
  [NETWORKS.ETHEREUM]: 'https://etherscan.io/token',
};

export const getTokenUrl = (network: Network, tokenId?: string) => {
  const baseURL = baseTokenURLs[network as keyof typeof baseTokenURLs];

  if (!baseURL || !tokenId) return null;

  return `${baseURL}/${tokenId}`;
};
