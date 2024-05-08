export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
  bitcoin: 'bitcoin',
} as const;

export const feeConfigTokenId = process.env.NEXT_PUBLIC_FEE_CONFIG_TOKEN_ID!;
export const feeConfigAddress = process.env.NEXT_PUBLIC_FEE_CONFIG_ADDRESS!;

export const CARDANO_BASE_TX_URL = 'https://cardanoscan.io/transaction/';
export const ERGO_BASE_TX_URL =
  'https://explorer.ergoplatform.com/transactions/';
export const ERGO_EXPLORER_URL = 'https://api.ergoplatform.com/';
