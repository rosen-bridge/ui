import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';
import type { CalculateFee } from '@rosen-network/base';
import { validateAddress } from '@rosen-network/base';

import { parseBitcoinCashServerConfig } from '../src/config';
import { createBitcoinCashServerRuntime } from '../src/server/runtime';
import { signingIntent } from './mocked/signing.mock';

const { candidate, readAssets, readHeight, submit, provider, submitter, queryFee, feeCreator } =
  vi.hoisted(() => {
    const readAssets = vi.fn(async () => ({ nativeToken: 100001n, tokens: [] }));
    const readHeight = vi.fn(async () => 900000);
    const submit = vi.fn(async () => '11'.repeat(32));
    const provider = vi.fn(() => ({
      getAddressAssets: readAssets,
      getSpendableUtxos: vi.fn(async () => []),
      getHeight: readHeight,
    }));
    const submitter = vi.fn(() => ({ submit }));
    const queryFee = vi.fn<CalculateFee>();
    const feeCreator = vi.fn(() => queryFee);
    return {
      candidate: { index: 10 },
      readAssets,
      readHeight,
      submit,
      provider,
      submitter,
      queryFee,
      feeCreator,
    };
  });
vi.mock('../src/server/bitcoinCashElectrumProvider', () => ({
  createBitcoinCashElectrumProvider: provider,
}));
vi.mock('../src/server/bitcoinCashElectrumSubmitter', () => ({
  createBitcoinCashElectrumSubmitter: submitter,
}));
vi.mock('@rosen-network/base', () => ({
  calculateFeeCreator: feeCreator,
  validateAddress: vi.fn(async () => true),
}));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    NETWORKS: {
      ...actual.NETWORKS,
      'bitcoin-cash': {
        ...actual.NETWORKS['bitcoin-cash'],
        get index() {
          return candidate.index;
        },
      },
    },
  };
});

/** Complete explicit server configuration and an actual native BCH/Ergo token map. */
const fixture = async () => {
  const config = parseBitcoinCashServerConfig(
    {
      lockAddress: signingIntent().lockAddress,
      nextHeightInterval: 7,
    },
    {
      hostname: 'electrum.example.org',
      port: 50002,
      timeoutMs: 1000,
      feeRate: 2,
      maxFeeSatoshis: '10000',
      allowedDestinationChains: ['ergo'],
      minimumFeeNFT: '22'.repeat(32),
    },
  );
  if (!config) throw new Error('Missing configuration fixture');
  const token = {
    tokenId: 'bch',
    name: 'BCH',
    type: 'native',
    decimals: 8,
    residency: 'native',
    extra: {},
  };
  const map = new TokenMap();
  await map.updateConfigByJson([
    {
      'bitcoin-cash': token,
      ergo: { ...token, type: 'token', tokenId: '11'.repeat(32), decimals: 3 },
    },
  ]);
  return { config, map };
};
afterEach(() => {
  candidate.index = 10;
  vi.clearAllMocks();
});

describe('createBitcoinCashServerRuntime', () => {
  /**
   * @target createBitcoinCashServerRuntime rejects another address network without reading ports
   * @dependencies Complete server runtime and the shared address validator spy.
   * @scenario rejects another address network without reading ports
   * @expected Return false for another source chain without invoking the shared validator.
   */
  it('rejects another address network without reading ports', async () => {
    const { config, map } = await fixture();
    const runtime = createBitcoinCashServerRuntime(config, async () => map);
    expect(await runtime.validateAddress('ethereum', 'source')).toEqual(false);
    expect(validateAddress).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashServerRuntime rejects construction authority %s
   * @dependencies Complete explicit policy with one independently changed authority field.
   * @scenario Unassign BCH or replace only policy treasury with a different valid P2PKH address.
   * @expected Reject before provider, submitter or fee factory construction.
   */
  it.each(['index', 'treasury'])('rejects construction authority %s', async (mutation) => {
    const { config, map } = await fixture();
    if (mutation === 'index') candidate.index = -1;
    const changed =
      mutation === 'treasury'
        ? { ...config, policy: { ...config.policy, lockAddress: signingIntent().fromAddress } }
        : config;
    expect(() => createBitcoinCashServerRuntime(changed, async () => map)).toThrow();
    expect(provider).not.toHaveBeenCalled();
    expect(submitter).not.toHaveBeenCalled();
    expect(feeCreator).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashServerRuntime wires explicit server producers lazily
   * @dependencies Typed factory mocks and explicit TLS/quote policy.
   * @scenario Construct the runtime and read native balance through its reader.
   * @expected Pass exact endpoint/policy, expose seven completed ports, and start no quote or submission.
   */
  it('wires explicit server producers lazily', async () => {
    const { config, map } = await fixture();
    const runtime = createBitcoinCashServerRuntime(config, async () => map);
    expect(provider).toHaveBeenCalledWith(config.electrum);
    expect(submitter).toHaveBeenCalledWith(config.electrum, config.policy);
    expect(feeCreator).toHaveBeenCalledWith('bitcoin-cash', readHeight);
    expect(readAssets).not.toHaveBeenCalled();
    expect(readHeight).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    expect(queryFee).not.toHaveBeenCalled();
    expect(await runtime.getAddressBalance(signingIntent().fromAddress)).toEqual(100001n);
    expect(readAssets).toHaveBeenCalledWith(signingIntent().fromAddress);
    for (const method of [
      'calculateFee',
      'getAddressBalance',
      'validateAddress',
      'getMinTransfer',
      'getMaxTransfer',
      'generateSigningParameters',
      'submitTransaction',
    ] as const)
      expect(typeof runtime[method]).toEqual('function');
  });
  describe('calculateFee', () => {
    /**
     * @target calculateFee forwards approved interval %i
     * @dependencies Actual TokenMap and typed Rosen fee creator port.
     * @scenario Request current interval zero or configured next interval seven.
     * @expected Forward exactly the approved route, token ID, interval and server NFT.
     */
    it.each([0, 7])('forwards approved interval %i', async (interval) => {
      const { config, map } = await fixture();
      const runtime = createBitcoinCashServerRuntime(config, async () => map);
      await runtime.calculateFee('ergo', '11'.repeat(32), interval, config.minimumFeeNFT);
      expect(queryFee).toHaveBeenCalledWith('ergo', '11'.repeat(32), interval, '22'.repeat(32));
    });
    /**
     * @target calculateFee rejects fee authority %s
     * @dependencies One independently corrupted query or native mapping field.
     * @scenario Change route, Ergo token ID, interval, NFT or native decimals.
     * @expected Reject before the actual fee query starts.
     */
    it.each(['route', 'token', 'interval', 'nft', 'mapping'])(
      'rejects fee authority %s',
      async (mutation) => {
        const { config, map } = await fixture();
        if (mutation === 'mapping') {
          const mapping = map.getTokenSet('bch');
          if (!mapping) throw new Error('Missing token fixture');
          mapping['bitcoin-cash'].decimals = 3;
        }
        const runtime = createBitcoinCashServerRuntime(config, async () => map);
        await expect(
          runtime.calculateFee(
            mutation === 'route' ? 'ethereum' : 'ergo',
            mutation === 'token' ? '33'.repeat(32) : '11'.repeat(32),
            mutation === 'interval' ? 8 : 7,
            mutation === 'nft' ? '44'.repeat(32) : config.minimumFeeNFT,
          ),
        ).rejects.toThrow();
        expect(queryFee).not.toHaveBeenCalled();
      },
    );
  });
});
