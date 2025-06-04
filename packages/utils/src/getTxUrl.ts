import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

/**
 * TODO: This util is temporary and its logic should be moved to individual
 * network packages
 *
 * local:ergo/rosen-bridge/ui#296
 */

const baseTxURLs: { [key in Network]: string } = {
  [NETWORKS.binance.key]: 'https://bscscan.com/tx',
  [NETWORKS.ergo.key]: 'https://explorer.ergoplatform.com/transactions',
  [NETWORKS.cardano.key]: 'https://cardanoscan.io/transaction',
  [NETWORKS.bitcoin.key]: 'https://mempool.space/tx',
  [NETWORKS.runes.key]: 'https://uniscan.cc/tx',
  [NETWORKS.ethereum.key]: 'https://etherscan.io/tx',
  [NETWORKS.doge.key]: 'https://blockexplorer.one/dogecoin/mainnet/tx',
};

export const getTxURL = (network: Network, tx: string) => {
  const baseURL = baseTxURLs[network as keyof typeof baseTxURLs];

  if (!baseURL) return null;

  return `${baseURL}/${tx}`;
};
