import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { signingIntent } from '../../../../networks/bitcoin-cash/tests/mocked/signing.mock';

const { state, initialize } = vi.hoisted(() => ({
  state: { enabled: true },
  initialize:
    vi.fn<
      (
        ...args: Parameters<
          typeof import('@rosen-ui/cashonize-wallet').createCashonizeWalletSession
        >
      ) => Promise<import('@rosen-ui/cashonize-wallet').CashonizeWalletSession>
    >(),
}));
vi.mock('@rosen-ui/cashonize-wallet', async () => ({
  ...(await vi.importActual<typeof import('@rosen-ui/cashonize-wallet')>(
    '@rosen-ui/cashonize-wallet',
  )),
  createCashonizeWalletSession: initialize,
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
   * @target cashonize
   * @dependencies Actual wallet and network constructors with a mocked package session factory.
   * @scenario initializes the SDK only after a user connection
   * @expected App import creates no session and disabled configuration creates no wallet.
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
   * @target cashonize
   * @dependencies Actual wallet constructor and a mocked package-owned session factory.
   * @scenario passes public configuration and pairing to the wallet package
   * @expected Map app settings to the package without owning session lifecycle behavior.
   */
  it('passes public configuration and pairing to the wallet package', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://bridge.example' } });
    initialize.mockResolvedValue({
      connect: async () => undefined,
      disconnect: async () => undefined,
      dispose: () => undefined,
      getAddress: () => signingIntent().fromAddress,
      sign: async () => {
        throw new Error('Unused test signing port');
      },
    });
    const { cashonize, cashonizePairing } = await import('../../src/wallets/cashonize');
    if (!cashonize) throw new Error('Missing assigned wallet fixture');
    await cashonize.performConnect();
    expect(initialize.mock.calls[0]).toEqual([
      {
        projectId: '12'.repeat(16),
        timeoutMs: 1000,
        metadata: {
          name: 'Rosen Bridge',
          description: 'Native Bitcoin Cash bridge deposit',
          url: 'https://bridge.example',
          icons: [],
        },
      },
      cashonizePairing,
      expect.any(Function),
    ]);
  });
});
