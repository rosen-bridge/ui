import { vi } from 'vitest';

import type { DataSource } from '@rosen-bridge/extended-typeorm';
import type { TokenMap } from '@rosen-bridge/tokens';
import {
  AssetCalculator,
  type BitcoinCashCalculatorInterface,
  LockedAssetEntity,
} from '@rosen-ui/asset-calculator';

/** Exposes the public constructor's protected BCH registration for result checks. */
class TestAssetCalculator extends AssetCalculator {
  /** Return the actual registered calculator without importing its internal class. */
  getBitcoinCashCalculator = () => {
    const calculator = this.calculatorMap.get('bitcoin-cash');
    if (!calculator) throw new Error('Missing BCH calculator fixture registration');
    return calculator;
  };
}

/**
 * Construct the public package entry with explicit BCH config and inert legacy ports.
 * Repository mocks observe public update writes without requiring a live database.
 * Token discovery is limited to BCH; the actual TokenMap wrapping stays unchanged.
 */
export const createCalculatorFixture = (
  tokens: TokenMap,
  config: BitcoinCashCalculatorInterface,
) => {
  const lockedRepository = {
    find: vi.fn(async () => []),
    save: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
  const otherRepository = {
    find: vi.fn(async () => []),
    save: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
  const dataSource = {
    getRepository: vi.fn((entity) =>
      entity === LockedAssetEntity ? lockedRepository : otherRepository,
    ),
  } as unknown as DataSource;
  vi.spyOn(tokens, 'getAllChains').mockReturnValue(['bitcoin-cash']);
  vi.spyOn(tokens, 'getSupportedChains').mockReturnValue([]);
  const calculator = new TestAssetCalculator(
    tokens,
    { addresses: [], explorerUrl: 'https://example.invalid' },
    { addresses: [] },
    { addresses: [] },
    { addresses: [] },
    { addresses: [], rpcUrl: 'https://example.invalid' },
    { addresses: [], rpcUrl: 'https://example.invalid' },
    { addresses: [], blockcypherUrl: 'https://example.invalid' },
    { addresses: [] },
    { addresses: [], rpcUrl: 'https://example.invalid' },
    dataSource,
    undefined,
    config,
  );
  return { calculator, lockedRepository };
};
