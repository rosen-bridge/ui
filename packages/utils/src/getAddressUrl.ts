import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

const baseAddressURLs: { [key in Network]: string } = {
  [NETWORKS.ERGO]: 'https://explorer.ergoplatform.com/en/addresses',
  [NETWORKS.CARDANO]: 'https://cardanoscan.io/address',
  [NETWORKS.BITCOIN]: 'https://mempool.space/address',
  [NETWORKS.ETHEREUM]: 'https://etherscan.io/address',
};

export const getAddressUrl = (network: Network, address?: string) => {
  const baseURL = baseAddressURLs[network as keyof typeof baseAddressURLs];

  if (!baseURL || !address) return null;

  return `${baseURL}/${address}`;
};
