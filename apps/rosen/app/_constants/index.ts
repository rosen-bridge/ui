export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
  bitcoin: 'bitcoin',
} as const;

export const feeConfigTokenId = process.env.NEXT_PUBLIC_FEE_CONFIG_TOKEN_ID!;

export const CARDANO_BASE_TX_URL = 'https://cardanoscan.io/transaction/';

export const BITCOIN_BASE_TX_URL =
  'https://blockchair.com/bitcoin/transaction/';

export const ERGO_BASE_TX_URL =
  'https://explorer.ergoplatform.com/transactions/';

export const BASE_TX_URL = new Map<string, string>([
  [Networks.ergo, ERGO_BASE_TX_URL],
  [Networks.cardano, CARDANO_BASE_TX_URL],
  [Networks.bitcoin, BITCOIN_BASE_TX_URL],
]);

export const ERGO_EXPLORER_URL = 'https://api.ergoplatform.com/';
