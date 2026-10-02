import { CashonizeWallet, createCashonizeSession } from '@rosen-ui/cashonize-wallet';

import { bitcoinCash } from '../networks/bitcoin-cash/client';
import { bitcoinCashPairing } from '../networks/bitcoin-cash/pairing';
import { bitcoinCashPublicConfig } from '../networks/bitcoin-cash/publicConfig';
import { getTokenMap } from '../tokenMap/getClientTokenMap';

/** Construct only the configured assigned network; relay SDK initialization waits for user connection. */
export const cashonize =
  bitcoinCash && bitcoinCashPublicConfig
    ? new CashonizeWallet({
        networks: [bitcoinCash],
        getTokenMap,
        /** Bind one UI pairing lease to the real pinned session factory and wallet cancellation. */
        createSession: async () => {
          const config = bitcoinCashPublicConfig;
          if (!config || typeof window === 'undefined')
            throw new Error('BCH wallet connection unavailable');
          const connection = new AbortController();
          const attempt = bitcoinCashPairing.begin(async () => {
            connection.abort();
            await cashonize?.disconnect();
          });
          try {
            const session = await createCashonizeSession({
              projectId: config.projectId,
              timeoutMs: config.walletTimeoutMs,
              metadata: {
                name: 'Rosen Bridge',
                description: 'Native Bitcoin Cash bridge deposit',
                url: window.location.origin,
                icons: [],
              },
              showUri: attempt.showUri,
              selectAccount: attempt.selectAccount,
            });
            return {
              getAddress: session.getAddress,
              sign: session.sign,
              /** Clear pairing material after successful authorization or rejected approval. */
              connect: async () => {
                try {
                  await session.connect(connection.signal);
                } finally {
                  attempt.finish();
                }
              },
              /** Clear pending presentation before disconnecting the actual session. */
              disconnect: async () => {
                connection.abort();
                attempt.finish();
                await session.disconnect();
              },
              /** Remove both UI and SDK listeners for an invalidated wallet lifecycle. */
              dispose: () => {
                connection.abort();
                attempt.finish();
                session.dispose();
              },
            };
          } catch {
            attempt.finish();
            throw new Error('BCH wallet connection unavailable');
          }
        },
      })
    : undefined;
