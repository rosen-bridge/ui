import type { CashonizePairing } from './pairing.js';
import { createCashonizeSession } from './session.js';
import type { CashonizeWalletSession } from './wallet.js';

export type CashonizeConnectionOptions = Omit<
  Parameters<typeof createCashonizeSession>[0],
  'showUri' | 'selectAccount'
>;

/** Bind one presentation attempt to the SDK session and wallet cancellation. */
export const createCashonizeWalletSession = async (
  options: CashonizeConnectionOptions,
  pairing: CashonizePairing,
  cancelWallet: () => Promise<void>,
): Promise<CashonizeWalletSession> => {
  const connection = new AbortController();
  const attempt = pairing.begin(async () => {
    connection.abort();
    await cancelWallet();
  });
  try {
    const session = await createCashonizeSession({
      ...options,
      showUri: attempt.showUri,
      selectAccount: attempt.selectAccount,
    });
    return {
      getAddress: session.getAddress,
      sign: session.sign,
      connect: async () => {
        try {
          await session.connect(connection.signal);
        } finally {
          attempt.finish();
        }
      },
      disconnect: async () => {
        connection.abort();
        attempt.finish();
        await session.disconnect();
      },
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
};
