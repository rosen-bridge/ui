import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCashonizeWalletSession } from '../src/connection';
import { CashonizePairing } from '../src/pairing';

const { initialize } = vi.hoisted(() => ({
  initialize:
    vi.fn<
      (
        options: Parameters<typeof import('../src/session').createCashonizeSession>[0],
      ) => Promise<import('../src/wallet').CashonizeWalletSession>
    >(),
}));
vi.mock('../src/session', () => ({ createCashonizeSession: initialize }));

/** Explicit relay project and public wallet metadata for lazy connection tests. */
const options = {
  projectId: '12'.repeat(16),
  timeoutMs: 1000,
  metadata: {
    name: 'Rosen Bridge',
    description: 'Native Bitcoin Cash bridge deposit',
    url: 'https://bridge.example',
    icons: [],
  },
};
/** Confirmed account sentinel used to verify the session address delegation. */
const address = 'bitcoincash:fixture';

afterEach(() => vi.clearAllMocks());

describe('createCashonizeWalletSession', () => {
  /**
   * @target createCashonizeWalletSession requires account confirmation and
   * clears the completed presentation
   * @dependencies Real pairing state and a mocked SDK session.
   * @scenario
   * - Mock a session that shows its URI and waits for account selection
   * - Connect
   * - Confirm the account
   * - Inspect cleared pairing
   * - Disconnect and dispose.
   * @expected Wait for explicit selection and delegate disconnect/disposal
   *   once.
   */
  it('requires account confirmation and clears the completed presentation', async () => {
    const pairing = new CashonizePairing();
    const disconnect = vi.fn(async () => undefined);
    const dispose = vi.fn();
    let shown!: () => void;
    const displayed = new Promise<void>((resolve) => {
      shown = resolve;
    });
    initialize.mockImplementation(async (config) => ({
      connect: async (signal?: AbortSignal) => {
        expect(signal?.aborted).toEqual(false);
        config.showUri('wc:fixture');
        const selected = config.selectAccount([address]);
        shown();
        expect(await selected).toEqual(address);
      },
      disconnect,
      dispose,
      getAddress: () => address,
      sign: async () => {
        throw new Error('Unused signing port');
      },
    }));
    const session = await createCashonizeWalletSession(options, pairing, async () => undefined);
    const connected = session.connect();
    await displayed;
    expect(pairing.getSnapshot()).toEqual({ address });
    pairing.confirm();
    await connected;
    expect(pairing.getSnapshot()).toEqual({});
    await session.disconnect();
    session.dispose();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });

  /**
   * @target createCashonizeWalletSession aborts pending approval when
   * presentation is cancelled
   * @dependencies Real pairing state and an abort-aware SDK connection port.
   * @scenario
   * - Mock an abort-aware pending connection
   * - Connect and display the URI
   * - Cancel pairing
   * - Check rejection, wallet cancellation, abort and cleared state.
   * @expected Abort the connection, invoke wallet cancellation and retain no
   *   pairing material.
   */
  it('aborts pending approval when presentation is cancelled', async () => {
    const pairing = new CashonizePairing();
    const cancelWallet = vi.fn(async () => undefined);
    let connectionSignal: AbortSignal | undefined;
    let shown!: () => void;
    const displayed = new Promise<void>((resolve) => {
      shown = resolve;
    });
    initialize.mockImplementation(async (config) => ({
      connect: async (signal?: AbortSignal) => {
        connectionSignal = signal;
        config.showUri('wc:fixture');
        shown();
        await new Promise<void>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('Cancelled SDK fixture')), {
            once: true,
          });
        });
      },
      disconnect: async () => undefined,
      dispose: () => undefined,
      getAddress: () => address,
      sign: async () => {
        throw new Error('Unused signing port');
      },
    }));
    const session = await createCashonizeWalletSession(options, pairing, cancelWallet);
    const connected = session.connect();
    const rejected = expect(connected).rejects.toThrow('Cancelled SDK fixture');
    await displayed;
    await pairing.cancel();
    await rejected;
    expect(cancelWallet).toHaveBeenCalledOnce();
    expect(connectionSignal?.aborted).toEqual(true);
    expect(pairing.getSnapshot()).toEqual({});
  });
});
