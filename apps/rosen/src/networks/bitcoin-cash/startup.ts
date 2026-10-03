import { parseBitcoinCashPublicConfig, parseBitcoinCashServerConfig } from './config';

/** Validate enabled public settings everywhere and complete operator authority at server startup. */
export const validateBitcoinCashStartup = (
  input: {
    enabled: boolean;
    lockAddress: unknown;
    nextHeightInterval: unknown;
    walletTimeoutMs: unknown;
    projectId: unknown;
    hostname?: unknown;
    port?: unknown;
    timeoutMs?: unknown;
    feeRate?: unknown;
    maxFeeSatoshis?: unknown;
    allowedDestinationChains?: unknown;
    minimumFeeNFT?: unknown;
  },
  isServer: boolean,
): void => {
  const publicConfig = parseBitcoinCashPublicConfig(input);
  if (!isServer || !publicConfig) return;
  parseBitcoinCashServerConfig(publicConfig, {
    hostname: input.hostname,
    port: input.port,
    timeoutMs: input.timeoutMs,
    feeRate: input.feeRate,
    maxFeeSatoshis: input.maxFeeSatoshis,
    allowedDestinationChains: input.allowedDestinationChains,
    minimumFeeNFT: input.minimumFeeNFT,
  });
};
