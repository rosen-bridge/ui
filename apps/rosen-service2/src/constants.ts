import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';

export const SUPPORTED_CHAINS = NETWORKS_KEYS.filter(
  (k) => k != NETWORKS.runes.key,
);
