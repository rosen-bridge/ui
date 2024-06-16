/**
 * TODO: This util is temporary and its logic should be moved to individual
 * network packages
 *
 * local:ergo/rosen-bridge/ui#296
 */

const baseTxURLs = {
  ergo: 'https://explorer.ergoplatform.com/transactions',
  cardano: 'https://cardanoscan.io/transaction',
  bitcoin: 'https://mempool.space/tx',
};

export const getTxURL = (network: string, tx: string) => {
  const baseURL = baseTxURLs[network as keyof typeof baseTxURLs];

  if (!baseURL) return null;

  return `${baseURL}/${tx}`;
};
