import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

const baseTokenURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/token',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/en/token',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/token',
  [NETWORKS.bitcoin.key]: '',
  [NETWORKS['bitcoin-cash'].key]: '',
  [NETWORKS['bitcoin-runes'].key]: 'https://unisat.io/runes/detail',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/token',
  [NETWORKS.doge.key]: '',
  [NETWORKS.firo.key]: '',
  [NETWORKS.handshake.key]: '',
};

/**
 * Returns a token explorer link for chains supporting token assets.
 * @param network Registered chain key.
 * @param tokenId Token identifier; native-only chains have no token link.
 */
export const getTokenUrl = (network?: Network, tokenId?: string): string | undefined => {
  if (!network || !tokenId) return;

  const baseURL = baseTokenURLs[network as keyof typeof baseTokenURLs];

  if (!baseURL) return;

  return `${baseURL}/${tokenId}`;
};
