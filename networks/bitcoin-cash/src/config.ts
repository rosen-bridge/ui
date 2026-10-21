import { decodeCashAddress } from '@bitauth/libauth/build/lib/address/cash-address.js';

import { NETWORKS } from '@rosen-ui/constants';

import { isBitcoinCashRouteAvailable } from './registry.js';
import type { BitcoinCashElectrumOptions, BitcoinCashSubmissionPolicy } from './server/index.js';

/** Public browser settings contain neither Electrum endpoints nor credentials. */
export interface BitcoinCashPublicConfig {
  lockAddress: string;
  nextHeightInterval: number;
}

/** Server configuration combines the same treasury with explicit TLS endpoint and quote policy. */
export interface BitcoinCashServerConfig {
  public: Readonly<BitcoinCashPublicConfig>;
  electrum: Readonly<Required<BitcoinCashElectrumOptions>>;
  policy: Readonly<BitcoinCashSubmissionPolicy>;
  minimumFeeNFT: string;
}

/** Decode an explicitly provided bounded integer, allowing canonical decimal environment strings. */
const configuredInteger = (value: unknown, minimum: number, maximum: number): number => {
  const parsed =
    typeof value === 'string' && /^[1-9][0-9]{0,9}$/.test(value) ? Number(value) : value;
  if (
    typeof parsed !== 'number' ||
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    parsed > maximum
  )
    throw new Error('Invalid BCH app configuration');
  return parsed;
};

/** Require the accepted ordinary mainnet P2PKH treasury before constructing an app consumer. */
const treasury = (value: unknown): string => {
  if (
    typeof value !== 'string' ||
    value.length > 100 ||
    value !== value.toLowerCase() ||
    !value.startsWith('bitcoincash:')
  )
    throw new Error('Invalid BCH app configuration');
  const cash = decodeCashAddress(value);
  if (
    typeof cash === 'string' ||
    cash.type !== 'p2pkh' ||
    cash.prefix !== 'bitcoincash' ||
    cash.payload.length !== 20
  )
    throw new Error('Invalid BCH app configuration');
  return value;
};

/** Parse public settings only when explicitly enabled and Rosen has assigned the chain index. */
export const parseBitcoinCashPublicConfig = (input: {
  enabled: boolean;
  lockAddress: unknown;
  nextHeightInterval: unknown;
}): Readonly<BitcoinCashPublicConfig> | undefined => {
  if (typeof input.enabled !== 'boolean') throw new Error('Invalid BCH app configuration');
  if (!input.enabled) return;
  if (!isBitcoinCashRouteAvailable('bitcoin-cash'))
    throw new Error('BCH chain index is unassigned');
  return Object.freeze({
    lockAddress: treasury(input.lockAddress),
    nextHeightInterval: configuredInteger(input.nextHeightInterval, 1, 1000000),
  });
};

/** Parse operator-only server settings without manufacturing a quote NFT, endpoint or fee policy. */
export const parseBitcoinCashServerConfig = (
  publicConfig: Readonly<BitcoinCashPublicConfig> | undefined,
  input: {
    hostname: unknown;
    port: unknown;
    timeoutMs: unknown;
    feeRate: unknown;
    maxFeeSatoshis: unknown;
    allowedDestinationChains: unknown;
    minimumFeeNFT: unknown;
  },
): Readonly<BitcoinCashServerConfig> | undefined => {
  if (!publicConfig) return;
  const validatedPublic = parseBitcoinCashPublicConfig({
    enabled: true,
    lockAddress: publicConfig.lockAddress,
    nextHeightInterval: publicConfig.nextHeightInterval,
  });
  if (!validatedPublic) throw new Error('Invalid BCH app configuration');
  if (!isBitcoinCashRouteAvailable('bitcoin-cash'))
    throw new Error('BCH chain index is unassigned');
  if (
    typeof input.hostname !== 'string' ||
    !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/.test(input.hostname) ||
    typeof input.minimumFeeNFT !== 'string' ||
    !/^[0-9a-f]{64}$/.test(input.minimumFeeNFT) ||
    !Array.isArray(input.allowedDestinationChains) ||
    input.allowedDestinationChains.length < 1 ||
    input.allowedDestinationChains.length > Object.keys(NETWORKS).length ||
    new Set(input.allowedDestinationChains).size !== input.allowedDestinationChains.length ||
    input.allowedDestinationChains.some((chain) => !isBitcoinCashRouteAvailable(chain))
  )
    throw new Error('Invalid BCH app configuration');
  if (typeof input.maxFeeSatoshis !== 'string' || !/^[1-9][0-9]{0,15}$/.test(input.maxFeeSatoshis))
    throw new Error('Invalid BCH app configuration');
  const maxFee = BigInt(input.maxFeeSatoshis);
  if (maxFee > 2_100_000_000_000_000n) throw new Error('Invalid BCH app configuration');
  return Object.freeze({
    public: validatedPublic,
    electrum: Object.freeze({
      hostname: input.hostname,
      port: configuredInteger(input.port, 1, 65535),
      timeoutMs: configuredInteger(input.timeoutMs, 1, 30000),
    }),
    policy: Object.freeze({
      lockAddress: validatedPublic.lockAddress,
      feeRate: configuredInteger(input.feeRate, 1, 10000000),
      maxFee,
      allowedDestinationChains: Object.freeze([...input.allowedDestinationChains]),
    }),
    minimumFeeNFT: input.minimumFeeNFT,
  });
};
