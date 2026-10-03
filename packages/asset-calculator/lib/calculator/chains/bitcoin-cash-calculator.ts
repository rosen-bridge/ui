import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { encodeAddress } from '@rosen-bridge/address-codec';
import { NATIVE_TOKEN, type RosenChainToken, type TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';

import type { BitcoinCashBalanceProvider } from '../../interfaces';
import AbstractCalculator from '../abstract-calculator';

const MAX_NATIVE_SATOSHIS = 2_100_000_000_000_000n;
const MAX_ADDRESSES = 100;

/** Calculates confirmed native BCH treasury amounts from a read-only provider. */
export class BitcoinCashCalculator extends AbstractCalculator {
  readonly chain = NETWORKS['bitcoin-cash'].key;

  /**
   * Initializes bounded, distinct treasury addresses without querying a network.
   * @param tokenMap Shared Rosen wrapping configuration.
   * @param addresses Native mainnet treasury addresses; duplicates are rejected.
   * @param provider Authenticated read-only BCH asset provider.
   * @param logger Optional calculator logger.
   */
  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    private readonly provider: BitcoinCashBalanceProvider,
    logger?: AbstractLogger,
  ) {
    if (!Array.isArray(addresses) || addresses.length < 1 || addresses.length > MAX_ADDRESSES) {
      throw new RangeError('BCH calculator requires one to 100 treasury addresses');
    }
    const scripts = addresses.map((address) => encodeAddress('bitcoin-cash', address));
    if (new Set(scripts).size !== scripts.length) {
      throw new RangeError('BCH calculator treasury addresses must be distinct');
    }
    if (!provider || typeof provider.getAddressAssets !== 'function') {
      throw new TypeError('BCH calculator requires a read-only asset provider');
    }
    super(
      addresses.map((address) => address.toLowerCase()),
      logger,
      tokenMap,
    );
  }

  /**
   * Restricts accounting to the native BCH asset in its eight-decimal source unit.
   * @param token Chain-specific Rosen token metadata.
   */
  private validateNativeToken = (token: RosenChainToken): void => {
    if (
      token.type !== NATIVE_TOKEN ||
      token.tokenId !== NETWORKS['bitcoin-cash'].nativeToken ||
      token.decimals !== 8
    ) {
      throw new TypeError('BCH calculator supports only eight-decimal native BCH');
    }
  };

  /**
   * Native BCH issuance is not wrapped-token supply in this accounting model.
   * @param token Native BCH token metadata.
   * @returns Zero, as with the existing native Bitcoin calculator.
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    this.validateNativeToken(token);
    return 0n;
  };

  /**
   * Native BCH is not a wrapped token minted on its source chain.
   * @param token Native BCH token metadata.
   * @returns Zero wrapped-token balance; treasury amounts use the address method.
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    this.validateNativeToken(token);
    return 0n;
  };

  /**
   * Reads all native treasury balances, rejecting partial or malformed results.
   * @param token Native BCH token metadata.
   * @returns Nonzero confirmed native satoshi balances by canonical address.
   * @throws Error With a fixed message on provider failure or invalid raw assets.
   */
  getRawLockedAmountsPerAddress = async (
    token: RosenChainToken,
  ): Promise<{ address: string; amount: bigint }[]> => {
    this.validateNativeToken(token);
    try {
      const amounts = await Promise.all(
        this.addresses.map(async (address) => {
          const assets = await this.provider.getAddressAssets(address);
          if (
            typeof assets.nativeToken !== 'bigint' ||
            assets.nativeToken < 0n ||
            assets.nativeToken > MAX_NATIVE_SATOSHIS ||
            !Array.isArray(assets.tokens) ||
            assets.tokens.length !== 0
          ) {
            throw new RangeError('Invalid native BCH assets');
          }
          return { address, amount: assets.nativeToken };
        }),
      );
      if (amounts.reduce((total, { amount }) => total + amount, 0n) > MAX_NATIVE_SATOSHIS) {
        throw new RangeError('Invalid aggregate native BCH assets');
      }
      return amounts.filter(({ amount }) => amount > 0n);
    } catch {
      throw new Error('BCH treasury balance calculation failed');
    }
  };
}
