import { createBitcoinCashElectrumProvider } from '@rosen-network/bitcoin-cash/server';
import type { BitcoinCashCalculatorInterface } from '@rosen-ui/asset-calculator';

import type { BitcoinCashServiceConfig } from './config';

/**
 * Connects optional treasury accounting to the server-only authenticated provider.
 * @param options Validated operator configuration, disabled without endpoint defaults.
 * @returns Explicit native BCH accounting configuration, or undefined while disabled.
 */
export const createBitcoinCashCalculatorConfig = (
  options: BitcoinCashServiceConfig,
): BitcoinCashCalculatorInterface | undefined =>
  options.enabled
    ? {
        addresses: options.calculatorAddresses,
        provider: createBitcoinCashElectrumProvider(options.electrum),
      }
    : undefined;
