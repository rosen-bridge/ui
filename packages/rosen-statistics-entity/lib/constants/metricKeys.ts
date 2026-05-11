export const METRIC_KEYS = {
  NUMBER_OF_NETWORKS: 'number_of_networks',
  NUMBER_OF_TOKENS: 'number_of_tokens',
  RSN_PRICE_USD: 'rsn_price_usd',
  TOTAL_LOCKED_ASSETS_USD: 'total_locked_assets_usd',
  EVENT_COUNT_TOTAL: 'event_count_total',
  USER_COUNT_TOTAL: 'user_count_total',
  WATCHER_COUNT_TOTAL: 'watcher_count_total',
  TOTAL_BRIDGE_FEES_USD: 'total_bridge_fees_usd',
  TOTAL_BRIDGE_AMOUNT_USD: 'total_bridge_amount_usd',
} as const;

export type MetricKey = (typeof METRIC_KEYS)[keyof typeof METRIC_KEYS];
