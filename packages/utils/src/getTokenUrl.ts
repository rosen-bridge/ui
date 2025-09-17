import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

const baseTokenURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/token',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/en/token',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/token',
  [NETWORKS.bitcoin.key]: '',
  [NETWORKS['bitcoin-runes'].key]: 'https://unisat.io/runes/detail',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/token',
  [NETWORKS.doge.key]: '',
};

export const getTokenUrl = (
  network?: Network,
  tokenId?: string,
): string | undefined => {
  if (!network || !tokenId) return;

  const baseURL = baseTokenURLs[network as keyof typeof baseTokenURLs];

  if (!baseURL) return;

  return `${baseURL}/${tokenId}`;
};
