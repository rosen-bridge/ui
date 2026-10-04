import {
  CashonizePairing,
  CashonizeWallet,
  createCashonizeWalletSession,
} from '@rosen-ui/cashonize-wallet';

import { bitcoinCash } from '../networks/bitcoin-cash/client';
import { bitcoinCashPublicConfig } from '../networks/bitcoin-cash/publicConfig';
import { getTokenMap } from '../tokenMap/getClientTokenMap';

export const cashonizePairing = new CashonizePairing();

/** App wiring for a team-supplied pairing presentation. */
export const cashonize: CashonizeWallet | undefined =
  bitcoinCash && bitcoinCashPublicConfig
    ? new CashonizeWallet({
        networks: [bitcoinCash],
        getTokenMap,
        createSession: async () => {
          const config = bitcoinCashPublicConfig;
          if (!config || typeof window === 'undefined')
            throw new Error('BCH wallet connection unavailable');
          return createCashonizeWalletSession(
            {
              projectId: config.projectId,
              timeoutMs: config.walletTimeoutMs,
              metadata: {
                name: 'Rosen Bridge',
                description: 'Native Bitcoin Cash bridge deposit',
                url: window.location.origin,
                icons: [],
              },
            },
            cashonizePairing,
            async () => {
              await cashonize?.disconnect();
            },
          );
        },
      })
    : undefined;
