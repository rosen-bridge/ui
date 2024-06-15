export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
  bitcoin: 'bitcoin',
} as const;

export const feeConfigTokenId = process.env.NEXT_PUBLIC_FEE_CONFIG_TOKEN_ID!;

export const ERGO_EXPLORER_URL = 'https://api.ergoplatform.com/';
