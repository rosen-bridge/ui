import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

const baseAddressURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/address',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/en/addresses',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/address',
  [NETWORKS.bitcoin.key]: 'https://mempool.space/address',
  [NETWORKS['bitcoin-cash'].key]: 'https://blockchair.com/bitcoin-cash/address',
  [NETWORKS['bitcoin-runes'].key]: 'https://uniscan.cc/address',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/address',
  [NETWORKS.doge.key]: 'https://blockexplorer.one/dogecoin/mainnet/address',
  [NETWORKS.firo.key]: 'https://explorer.firo.org/address',
  [NETWORKS.handshake.key]: 'https://e.hnsfans.com/address',
};

/**
 * Returns an explorer address link without implying route availability.
 * @param network Registered chain key.
 * @param address Address to display in the chain explorer.
 */
export const getAddressUrl = (network?: Network, address?: string): string | undefined => {
  if (!network || !address) return;

  const baseURL = baseAddressURLs[network as keyof typeof baseAddressURLs];

  if (!baseURL) return;

  const explorerAddress =
    network === NETWORKS['bitcoin-cash'].key ? address.replace(/^bitcoincash:/i, '') : address;
  return `${baseURL}/${explorerAddress}`;
};
