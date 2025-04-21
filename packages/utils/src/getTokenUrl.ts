import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

const baseTokenURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/token',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/en/token',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/token',
  [NETWORKS.bitcoin.key]: '',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/token',
  [NETWORKS.doge.key]: '',
};

export const getTokenUrl = (network: Network, tokenId?: string) => {
  const baseURL = baseTokenURLs[network as keyof typeof baseTokenURLs];

  if (!baseURL || !tokenId) return null;

  return `${baseURL}/${tokenId}`;
};
