import { BitcoinCashNetwork } from '@rosen-network/bitcoin-cash/client';

import { getTokenMap } from '../../tokenMap/getClientTokenMap';
import { bitcoinCashPublicConfig } from './publicConfig';
import * as actions from './server';
import { createBitcoinCashSubmissionClient } from './submissionClient';

/** Public settings plus completed typed app ports; no endpoint or treasury default is manufactured. */
export const bitcoinCash = bitcoinCashPublicConfig
  ? new BitcoinCashNetwork({
      lockAddress: bitcoinCashPublicConfig.lockAddress,
      nextHeightInterval: bitcoinCashPublicConfig.nextHeightInterval,
      getTokenMap,
      ...actions,
      submitTransaction: createBitcoinCashSubmissionClient({
        timeoutMs: bitcoinCashPublicConfig.walletTimeoutMs,
      }),
    })
  : undefined;
