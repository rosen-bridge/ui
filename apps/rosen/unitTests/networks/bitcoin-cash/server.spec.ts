import { afterEach, describe, expect, it, vi } from 'vitest';

import * as actions from '../../../src/networks/bitcoin-cash/server';

const { state, failed } = vi.hoisted(() => ({
  state: { available: true },
  failed: vi.fn(async () => {
    throw new Error('arbitrary provider diagnostic');
  }),
}));
vi.mock('../../../src/networks/bitcoin-cash/serverConfig', () => ({
  getBitcoinCashServerRuntime: () =>
    state.available
      ? {
          calculateFee: failed,
          getAddressBalance: failed,
          getMinTransfer: failed,
          getMaxTransfer: failed,
          generateSigningParameters: failed,
          validateAddress: failed,
        }
      : undefined,
}));
afterEach(() => {
  state.available = true;
  vi.clearAllMocks();
});

describe.each([
  {
    name: 'calculateFee',
    invoke: () => actions.calculateFee('ergo', '11'.repeat(32), 1, '22'.repeat(32)),
    message: 'BCH fee query failed',
  },
  {
    name: 'getAddressBalance',
    invoke: () => actions.getAddressBalance('bitcoincash:invalid'),
    message: 'BCH balance query failed',
  },
  {
    name: 'getMinTransfer',
    invoke: () =>
      actions.getMinTransfer(
        {
          tokenId: 'bch',
          type: 'native',
          decimals: 8,
          residency: 'native',
          name: 'BCH',
          extra: {},
        },
        'ergo',
        '22'.repeat(32),
      ),
    message: 'BCH minimum query failed',
  },
  {
    name: 'getMaxTransfer',
    invoke: () =>
      actions.getMaxTransfer({
        balance: 1n,
        isNative: true,
        eventData: { fromAddress: 'source', toChain: 'ergo', toAddress: 'destination' },
      }),
    message: 'BCH maximum query failed',
  },
  {
    name: 'generateSigningParameters',
    invoke: () =>
      actions.generateSigningParameters({
        amount: 1n,
        fromAddress: 'source',
        toChain: 'ergo',
        toAddress: 'destination',
        bridgeFee: 0n,
        networkFee: 0n,
      }),
    message: 'BCH preparation failed',
  },
  {
    name: 'validateAddress',
    invoke: () => actions.validateAddress('bitcoin-cash', 'source'),
    message: 'BCH address validation failed',
  },
])('$name', ({ invoke, message }) => {
  /**
   * @target Public action errors never echo provider, quote or mapping diagnostics.
   * @dependencies Failing completed server ports containing an arbitrary diagnostic marker.
   * @scenario Invoke each small action through its actual public wrapper.
   * @expected Return only the exact fixed message corresponding to that operation.
   */
  it('sanitizes provider errors', async () => {
    await expect(invoke()).rejects.toMatchObject({ message });
    expect(failed).toHaveBeenCalledOnce();
  });
});

describe('getAddressBalance', () => {
  /**
   * @target Disabled configuration remains unavailable without calling a provider.
   * @dependencies No server runtime.
   * @scenario Request a balance while BCH is disabled.
   * @expected Reject with the fixed balance error and perform no remote operation.
   */
  it('rejects disabled runtime without a provider call', async () => {
    state.available = false;
    await expect(actions.getAddressBalance('source')).rejects.toMatchObject({
      message: 'BCH balance query failed',
    });
    expect(failed).not.toHaveBeenCalled();
  });
});

describe('validateAddress', () => {
  /**
   * @target The BCH action cannot be used as an arbitrary other-chain address endpoint.
   * @dependencies Public BCH address wrapper and provider spy.
   * @scenario Supply Ethereum as the source chain.
   * @expected Return false without calling server network ports.
   */
  it('rejects another address network without reading ports', async () => {
    expect(await actions.validateAddress('ethereum', 'source')).toEqual(false);
    expect(failed).not.toHaveBeenCalled();
  });
});
