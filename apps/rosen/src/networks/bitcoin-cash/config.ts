import {
  type BitcoinCashPublicConfig as NetworkPublicConfig,
  parseBitcoinCashPublicConfig as parseNetworkPublicConfig,
} from '@rosen-network/bitcoin-cash/config';
import { validateCashonizeConnectionConfig } from '@rosen-ui/cashonize-wallet/config';

export {
  type BitcoinCashServerConfig,
  parseBitcoinCashServerConfig,
} from '@rosen-network/bitcoin-cash/config';

export interface BitcoinCashPublicConfig extends NetworkPublicConfig {
  walletTimeoutMs: number;
  projectId: string;
}

/** Connect validated network settings to the wallet's explicit connection settings. */
export const parseBitcoinCashPublicConfig = (input: {
  enabled: boolean;
  lockAddress: unknown;
  nextHeightInterval: unknown;
  walletTimeoutMs: unknown;
  projectId: unknown;
}): Readonly<BitcoinCashPublicConfig> | undefined => {
  const network = parseNetworkPublicConfig(input);
  if (!network) return;
  const wallet = validateCashonizeConnectionConfig({
    projectId: input.projectId,
    timeoutMs: input.walletTimeoutMs,
  });
  return Object.freeze({
    ...network,
    walletTimeoutMs: wallet.timeoutMs,
    projectId: wallet.projectId,
  });
};
