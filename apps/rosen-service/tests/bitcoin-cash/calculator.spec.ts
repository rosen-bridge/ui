import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashCalculator } from '../../../../packages/asset-calculator/lib/calculator/chains/bitcoin-cash-calculator';
import {
  addresses,
  nativeToken,
  wrappedToken,
} from '../../../../packages/asset-calculator/tests/calculator/chains/mocked/bitcoin-cash.mock';
import type { EnabledBitcoinCashConfig } from '../../src/bitcoin-cash/config';

const mocks = vi.hoisted(() => ({ factory: vi.fn(), getAddressAssets: vi.fn() }));
vi.mock('@rosen-network/bitcoin-cash/server', () => ({
  createBitcoinCashElectrumProvider: mocks.factory,
}));

import { createBitcoinCashCalculatorConfig } from '../../src/bitcoin-cash/calculator';

const options: EnabledBitcoinCashConfig = {
  enabled: true,
  lockAddress: addresses[0],
  initialHeight: 800000,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  scanner: { intervalMs: 600000, warnDiff: 3, criticalDiff: 6 },
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
   * @target createBitcoinCashCalculatorConfig: Disabled service configuration does not construct a provider or query balances.
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
   * @target createBitcoinCashCalculatorConfig: Enabled accounting uses only explicit server TLS options and treasury addresses.
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
   * @target createBitcoinCashCalculatorConfig: The configured read port joins real native accounting and Rosen wrapping.
   * @dependencies Mock authenticated provider port; real BCH calculator and TokenMap.
   * @scenario Return 100001 satoshis for an eight-decimal native asset wrapped to three decimals.
   * @expected Raw native amount is preserved, wrapped amount is two, and canonical configured address is queried.
   */
  it('joins provider amounts to the real calculator conversion', async () => {
    const config = createBitcoinCashCalculatorConfig(options);
    if (!config) throw new Error('Expected enabled fixture');
    const tokens = new TokenMap();
    await tokens.updateConfigByJson([{ 'bitcoin-cash': nativeToken, ergo: wrappedToken }]);
    const calculator = new BitcoinCashCalculator(tokens, config.addresses, config.provider);
    expect(await calculator.getRawLockedAmountsPerAddress(nativeToken)).toEqual([
      { address: addresses[0], amount: 100001n },
    ]);
    expect(await calculator.getLockedAmountsPerAddress(nativeToken)).toEqual([
      { address: addresses[0], amount: 2n },
    ]);
    expect(mocks.getAddressAssets).toHaveBeenCalledWith(addresses[0]);
  });

  /**
   * @target createBitcoinCashCalculatorConfig: Provider failure remains an accounting failure after service wiring.
   * @dependencies Mock authenticated provider rejection; real BCH calculator.
   * @scenario Reject a provider query with diagnostic text.
   * @expected The shared calculator returns a fixed error without fallback balance.
   */
  it('preserves fail-closed provider errors', async () => {
    const config = createBitcoinCashCalculatorConfig(options);
    if (!config) throw new Error('Expected enabled fixture');
    mocks.getAddressAssets.mockRejectedValueOnce(new Error('private diagnostic'));
    const calculator = new BitcoinCashCalculator(new TokenMap(), config.addresses, config.provider);
    await expect(calculator.getRawLockedAmountsPerAddress(nativeToken)).rejects.toThrow(
      /^BCH treasury balance calculation failed$/,
    );
  });
});
