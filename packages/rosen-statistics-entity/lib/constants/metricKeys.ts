export const METRIC_KEYS = {
  NUMBER_OF_NETWORKS: 'number_of_networks',
  NUMBER_OF_TOKENS: 'number_of_tokens',
  RSN_PRICE_USD: 'rsn_price_usd',
  LOCKED_ASSETS_USD: 'locked_assets_usd',
  EVENT_COUNT_TOTAL: 'event_count_total',
  USER_COUNT_TOTAL: 'user_count_total',
} as const;

export type MetricKey = (typeof METRIC_KEYS)[keyof typeof METRIC_KEYS];
