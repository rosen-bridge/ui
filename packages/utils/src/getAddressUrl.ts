import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

const baseAddressURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/address',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/en/addresses',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/address',
  [NETWORKS.bitcoin.key]: 'https://mempool.space/address',
  [NETWORKS['bitcoin-runes'].key]: 'https://uniscan.cc/address',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/address',
  [NETWORKS.doge.key]: 'https://blockexplorer.one/dogecoin/mainnet/address',
};

export const getAddressUrl = (
  network?: Network,
  address?: string,
): string | undefined => {
  if (!network || !address) return;

  const baseURL = baseAddressURLs[network as keyof typeof baseAddressURLs];

  if (!baseURL) return;

  return `${baseURL}/${address}`;
};
