import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import type { EnabledBitcoinCashConfig } from '../../src/bitcoin-cash/config';
import { addresses, nativeToken, wrappedToken } from './bitcoinCashTestData';
import { createCalculatorFixture } from './calculatorTestUtils';

const mocks = vi.hoisted(() => ({ factory: vi.fn(), getAddressAssets: vi.fn() }));
vi.mock('@rosen-network/bitcoin-cash/server', () => ({
  createBitcoinCashElectrumProvider: mocks.factory,
}));

import { createBitcoinCashCalculatorConfig } from '../../src/bitcoin-cash/calculator';

/** Explicit enabled operator profile with native treasury and TLS read port. */
const options: EnabledBitcoinCashConfig = {
  enabled: true,
  lockAddress: addresses[0],
  initialHeight: 800000,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  cleanup: { thresholdSeconds: 86400, trimCount: 100 },
  commitment: { address: 'unused by calculator', rwt: '11'.repeat(32) },
  eventTrigger: { address: 'unused', permitAddress: 'unused', fraudAddress: 'unused' },
  electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
  calculatorAddresses: [addresses[0]],
};

describe('createBitcoinCashCalculatorConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.factory.mockReturnValue({ getAddressAssets: mocks.getAddressAssets });
    mocks.getAddressAssets.mockResolvedValue({ nativeToken: 100001n, tokens: [] });
  });

  /**
   * @target createBitcoinCashCalculatorConfig does not construct a provider
   * while disabled
   * @dependencies Mock server-only provider factory.
   * @scenario Resolve the optional calculator configuration with BCH disabled.
   * @expected Undefined configuration and no provider side effects.
   */
  it('does not construct a provider while disabled', () => {
    expect(createBitcoinCashCalculatorConfig({ enabled: false })).toBeUndefined();
    expect(mocks.factory).not.toHaveBeenCalled();
    expect(mocks.getAddressAssets).not.toHaveBeenCalled();
  });

  /**
   * @target createBitcoinCashCalculatorConfig passes explicit TLS options
   * without credentials or endpoint defaults
   * @dependencies Mock server-only provider factory.
   * @scenario Resolve complete validated BCH configuration.
   * @expected Exact configured endpoint, optional calculator port and no eager balance query.
   */
  it('passes explicit TLS options without credentials or endpoint defaults', () => {
    const config = createBitcoinCashCalculatorConfig(options);
    expect(mocks.factory).toHaveBeenCalledWith(options.electrum);
    expect(config?.addresses).toEqual(options.calculatorAddresses);
    expect(config?.provider.getAddressAssets).toBe(mocks.getAddressAssets);
    expect(mocks.getAddressAssets).not.toHaveBeenCalled();
  });

  /**
   * @target createBitcoinCashCalculatorConfig joins provider amounts to the
   * real calculator conversion
   * @dependencies Mock provider and repositories; public AssetCalculator constructor
   * and update, real TokenMap wrapping, BCH-only token discovery.
   * @scenario Resolve Service configuration, register it through the public package,
   * return 100001 satoshis, check raw/wrapped balances, then run the public update.
   * @expected Exact raw balance, two wrapped units stored at the configured address.
   */
  it('joins provider amounts to the real calculator conversion', async () => {
    const config = createBitcoinCashCalculatorConfig(options);
    if (!config) throw new Error('Expected enabled fixture');
    const tokens = new TokenMap();
    await tokens.updateConfigByJson([{ 'bitcoin-cash': nativeToken, ergo: wrappedToken }]);
    const { calculator, lockedRepository } = createCalculatorFixture(tokens, config);
    const bitcoinCashCalculator = calculator.getBitcoinCashCalculator();
    expect(await bitcoinCashCalculator.getRawLockedAmountsPerAddress(nativeToken)).toEqual([
      { address: addresses[0], amount: 100001n },
    ]);
    expect(await bitcoinCashCalculator.getLockedAmountsPerAddress(nativeToken)).toEqual([
      { address: addresses[0], amount: 2n },
    ]);
    expect(mocks.getAddressAssets).toHaveBeenCalledWith(addresses[0]);
    await calculator.update();
    expect(lockedRepository.save).toHaveBeenCalledWith({
      amount: 2n,
      address: addresses[0],
      tokenId: nativeToken.tokenId,
      token: expect.objectContaining({
        id: nativeToken.tokenId,
        chain: 'bitcoin-cash',
        decimal: 8,
        significantDecimal: 3,
        ergoSideTokenId: wrappedToken.tokenId,
      }),
    });
  });

  /**
   * @target createBitcoinCashCalculatorConfig preserves fail-closed provider
   * errors
   * @dependencies Mock provider rejection and repositories; public AssetCalculator
   * constructor and update with real BCH accounting and TokenMap wrapping.
   * @scenario Register Service config through the package, reject provider reads,
   * then query raw accounting and run the public update independently.
   * @expected Fixed accounting error from both calls and no locked-balance write.
   */
  it('preserves fail-closed provider errors', async () => {
    const config = createBitcoinCashCalculatorConfig(options);
    if (!config) throw new Error('Expected enabled fixture');
    mocks.getAddressAssets.mockRejectedValue(new Error('private diagnostic'));
    const tokens = new TokenMap();
    await tokens.updateConfigByJson([{ 'bitcoin-cash': nativeToken, ergo: wrappedToken }]);
    const { calculator, lockedRepository } = createCalculatorFixture(tokens, config);
    await expect(
      calculator.getBitcoinCashCalculator().getRawLockedAmountsPerAddress(nativeToken),
    ).rejects.toThrow(/^BCH treasury balance calculation failed$/);
    await expect(calculator.update()).rejects.toThrow(/^BCH treasury balance calculation failed$/);
    expect(lockedRepository.save).not.toHaveBeenCalled();
  });
});
