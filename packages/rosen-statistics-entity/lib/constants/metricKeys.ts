export const METRIC_KEYS = {
  NUMBER_OF_NETWORKS: 'number_of_networks',
  NUMBER_OF_TOKENS: 'number_of_tokens',
  RSN_PRICE_USD: 'rsn_price_usd',
} as const;

export type MetricKey = (typeof METRIC_KEYS)[keyof typeof METRIC_KEYS];
