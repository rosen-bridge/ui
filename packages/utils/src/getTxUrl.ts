import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

/**
 * TODO: This util is temporary and its logic should be moved to individual
 * network packages
 *
 * local:ergo/rosen-bridge/ui#296
 */

const baseTxURLs: { [key in Network]: string } = {
  [NETWORKS.BINANCE]: 'https://bscscan.com/tx',
  [NETWORKS.ERGO]: 'https://explorer.ergoplatform.com/transactions',
  [NETWORKS.CARDANO]: 'https://cardanoscan.io/transaction',
  [NETWORKS.BITCOIN]: 'https://mempool.space/tx',
  [NETWORKS.ETHEREUM]: 'https://etherscan.io/tx',
};

export const getTxURL = (network: Network, tx: string) => {
  const baseURL = baseTxURLs[network as keyof typeof baseTxURLs];

  if (!baseURL) return null;

  return `${baseURL}/${tx}`;
};
