import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { signingIntent } from '../../../../networks/bitcoin-cash/tests/mocked/signing.mock';

const { state, initialize } = vi.hoisted(() => ({
  state: { enabled: true },
  initialize:
    vi.fn<
      (
        options: Parameters<typeof import('@rosen-ui/cashonize-wallet').createCashonizeSession>[0],
      ) => Promise<import('@rosen-ui/cashonize-wallet').CashonizeWalletSession>
    >(),
}));
vi.mock('@rosen-ui/cashonize-wallet', async () => ({
  ...(await vi.importActual<typeof import('@rosen-ui/cashonize-wallet')>(
    '@rosen-ui/cashonize-wallet',
  )),
  createCashonizeSession: initialize,
}));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    NETWORKS: {
      ...actual.NETWORKS,
      'bitcoin-cash': { ...actual.NETWORKS['bitcoin-cash'], index: 10 },
    },
  };
});
vi.mock('../../src/networks/bitcoin-cash/publicConfig', () => ({
  get bitcoinCashPublicConfig() {
    return state.enabled
      ? {
          lockAddress: signingIntent().lockAddress,
          nextHeightInterval: 100,
          walletTimeoutMs: 1000,
          projectId: '12'.repeat(16),
        }
      : undefined;
  },
}));
vi.mock('../../src/tokenMap/getClientTokenMap', () => ({
  getTokenMap: async () => new TokenMap(),
}));
vi.mock('../../src/networks/bitcoin-cash/client', async () => {
  const { BitcoinCashNetwork } = await import('@rosen-network/bitcoin-cash/client');
  const fee = {
    bridgeFee: 1n,
    networkFee: 1n,
    feeRatio: 0n,
    feeRatioDivisor: 1n,
    rsnRatio: 0n,
    rsnRatioDivisor: 1n,
  };
  return {
    bitcoinCash: state.enabled
      ? new BitcoinCashNetwork({
          lockAddress: signingIntent().lockAddress,
          nextHeightInterval: 100,
          getTokenMap: async () => new TokenMap(),
          calculateFee: async () => ({ fees: fee, nextFees: fee }),
          getAddressBalance: async () => 0n,
          getMinTransfer: async () => 0n,
          getMaxTransfer: async () => 0n,
          validateAddress: async () => true,
          generateSigningParameters: async () => {
            throw new Error('Unused test preparation port');
          },
          submitTransaction: async () => {
            throw new Error('Unused test submission port');
          },
        })
      : undefined,
  };
});

afterEach(() => {
  state.enabled = true;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('cashonize', () => {
  /**
   * @target App import does not initialize a relay SDK and disabled configuration creates no wallet.
   * @dependencies Actual CashonizeWallet/BitcoinCashNetwork constructors with explicit synthetic configuration.
   * @scenario Import an enabled candidate, then a disabled app registration.
   * @expected Offer the configured wallet without initializing SDK; omit the disabled instance entirely.
   */
  it('initializes the SDK only after a user connection', async () => {
    const first = await import('../../src/wallets/cashonize');
    expect(first.cashonize?.name).toEqual('Cashonize');
    expect(initialize).not.toHaveBeenCalled();
    vi.resetModules();
    state.enabled = false;
    const second = await import('../../src/wallets/cashonize');
    expect(second.cashonize).toEqual(undefined);
    expect(initialize).not.toHaveBeenCalled();
  });
  /**
   * @target The production app factory binds explicit account confirmation to one real wallet lifecycle.
   * @dependencies Actual wallet/network classes and pairing store; only the relay session factory is mocked.
   * @scenario User connects, SDK presents its approved first account, and user confirms it.
   * @expected Pass actual public metadata/project/deadline, wait for confirmation and clear pairing state.
   */
  it('connects through explicit pairing confirmation', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://bridge.example' } });
    const address = signingIntent().fromAddress;
    let shown: (() => void) | undefined;
    const displayed = new Promise<void>((resolve) => {
      shown = resolve;
    });
    const disconnect = vi.fn(async () => undefined);
    const dispose = vi.fn();
    initialize.mockImplementation(async (options) => ({
      connect: async (signal) => {
        expect(signal?.aborted).toEqual(false);
        options.showUri('wc:fixture');
        const selected = options.selectAccount([address]);
        shown?.();
        expect(await selected).toEqual(address);
      },
      disconnect,
      dispose,
      getAddress: () => address,
      sign: async () => {
        throw new Error('Unused test signing port');
      },
    }));
    const { cashonize } = await import('../../src/wallets/cashonize');
    const { bitcoinCashPairing } = await import('../../src/networks/bitcoin-cash/pairing');
    if (!cashonize) throw new Error('Missing assigned wallet fixture');
    const connected = cashonize.performConnect();
    await displayed;
    expect(bitcoinCashPairing.getSnapshot()).toEqual({ address });
    expect(initialize.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        projectId: '12'.repeat(16),
        timeoutMs: 1000,
        metadata: {
          name: 'Rosen Bridge',
          description: 'Native Bitcoin Cash bridge deposit',
          url: 'https://bridge.example',
          icons: [],
        },
      }),
    );
    bitcoinCashPairing.confirm();
    await connected;
    expect(bitcoinCashPairing.getSnapshot()).toEqual({});
    await cashonize.performDisconnect();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });
  /**
   * @target UI cancellation aborts pending approval instead of leaving the wallet connecting until timeout.
   * @dependencies Actual wallet/network/store join and an abort-aware mocked SDK connect port.
   * @scenario Cancel after a pairing URI appears while approval remains pending.
   * @expected Abort the original connection signal, reject the wallet connection and erase pairing material.
   */
  it('aborts the pending SDK connection when pairing is cancelled', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://bridge.example' } });
    let shown: (() => void) | undefined;
    const displayed = new Promise<void>((resolve) => {
      shown = resolve;
    });
    let connectionSignal: AbortSignal | undefined;
    const dispose = vi.fn();
    initialize.mockImplementation(async (options) => ({
      connect: async (signal) => {
        connectionSignal = signal;
        options.showUri('wc:fixture');
        shown?.();
        await new Promise<void>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('Cancelled SDK fixture')), {
            once: true,
          });
        });
      },
      disconnect: async () => undefined,
      dispose,
      getAddress: () => signingIntent().fromAddress,
      sign: async () => {
        throw new Error('Unused test signing port');
      },
    }));
    const { cashonize } = await import('../../src/wallets/cashonize');
    const { bitcoinCashPairing } = await import('../../src/networks/bitcoin-cash/pairing');
    if (!cashonize) throw new Error('Missing assigned wallet fixture');
    const pending = cashonize.performConnect();
    const rejected = expect(pending).rejects.toThrow(/^Cashonize connection failed$/);
    await displayed;
    await bitcoinCashPairing.cancel();
    await rejected;
    expect(connectionSignal?.aborted).toEqual(true);
    expect(bitcoinCashPairing.getSnapshot()).toEqual({});
    expect(dispose).toHaveBeenCalled();
  });
});
