import { FEE_CONFIG_TOKEN_ID } from '../../../configs';
import { env } from '../../env';
import { getTokenMap } from '../../tokenMap/getServerTokenMap';
import { parseBitcoinCashServerConfig } from './config';
import { bitcoinCashPublicConfig } from './publicConfig';
import { createBitcoinCashServerRuntime } from './runtime';

let runtime: ReturnType<typeof createBitcoinCashServerRuntime> | undefined;

/** Resolve operator-only settings lazily; disabled or unassigned BCH never creates server ports. */
export const getBitcoinCashServerRuntime = () => {
  if (runtime) return runtime;
  const config = parseBitcoinCashServerConfig(bitcoinCashPublicConfig, {
    hostname: env.BCH_ELECTRUM_HOSTNAME,
    port: env.BCH_ELECTRUM_PORT,
    timeoutMs: env.BCH_ELECTRUM_TIMEOUT_MS,
    feeRate: env.BCH_FEE_RATE,
    maxFeeSatoshis: env.BCH_MAX_FEE_SATOSHIS,
    allowedDestinationChains: env.BCH_ALLOWED_DESTINATION_CHAINS,
    minimumFeeNFT: FEE_CONFIG_TOKEN_ID,
  });
  if (!config) return;
  runtime = createBitcoinCashServerRuntime(config, getTokenMap);
  return runtime;
};
