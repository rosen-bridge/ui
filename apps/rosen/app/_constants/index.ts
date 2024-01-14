export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
} as const;

export const feeConfigTokenId = process.env.NEXT_PUBLIC_FEE_CONFIG_TOKEN_ID!;

export const CARDANO_BASE_TX_URL = 'https://cardanoscan.io/transaction/';
export const ERGO_BASE_TX_URL =
  'https://explorer.ergoplatform.com/transactions/';
