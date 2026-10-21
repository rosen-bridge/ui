import { LOCK_ADDRESSES } from '../../../configs';
import { env } from '../../env';
import { parseBitcoinCashPublicConfig } from './config';

/** Disabled by default; an assigned index and complete operator settings precede browser registration. */
export const bitcoinCashPublicConfig = parseBitcoinCashPublicConfig({
  enabled: env.NEXT_PUBLIC_BCH_ENABLED,
  lockAddress: LOCK_ADDRESSES['bitcoin-cash'],
  nextHeightInterval: env.NEXT_PUBLIC_BCH_NEXT_HEIGHT_INTERVAL,
  walletTimeoutMs: env.NEXT_PUBLIC_BCH_WALLET_TIMEOUT_MS,
  projectId: env.NEXT_PUBLIC_REOWN_PROJECT_ID,
});
