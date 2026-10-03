import { encodeAddress, validateAddress } from '@rosen-bridge/address-codec';
import {
  type BitcoinCashRpcLimits,
  resolveBitcoinCashRpcLimits,
  validateBitcoinCashRpcCredentials,
  validateBitcoinCashRpcUrl,
} from '@rosen-bridge/bitcoin-cash-scanner';
import { NETWORKS } from '@rosen-ui/constants';

/** Operator configuration required before BCH scanner activation. */
export interface EnabledBitcoinCashConfig {
  enabled: true;
  lockAddress: string;
  initialHeight: number;
  rpc: {
    url: string;
    timeoutMs: number;
    username?: string;
    password?: string;
    limits?: Readonly<BitcoinCashRpcLimits>;
  };
  scanner: { intervalMs: number; warnDiff: number; criticalDiff: number };
  cleanup: { thresholdSeconds: number; trimCount: number };
  commitment: { address: string; rwt: string };
  eventTrigger: { address: string; permitAddress: string; fraudAddress: string };
  electrum: { hostname: string; port: number; timeoutMs: number };
  calculatorAddresses: string[];
}

/** Disabled BCH configuration does not carry defaults for operator-owned values. */
export type BitcoinCashServiceConfig = { enabled: false } | EnabledBitcoinCashConfig;

/** Identify a configuration object without accepting arrays or null. */
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
/** Identify a positive integer that can be represented without precision loss. */
const positiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;

/**
 * Validates the explicit BCH scanner boundary without starting a client.
 * @param value Optional operator configuration; absence keeps BCH disabled.
 * @param assignedChainIndex Shared Rosen chain index; injectable only for fixture qualification.
 * @returns A disabled branch or complete validated mainnet scanner configuration.
 * @throws Error With fixed text, without exposing endpoint credentials.
 */
export const readBitcoinCashConfig = (
  value: unknown,
  assignedChainIndex: number = NETWORKS['bitcoin-cash'].index,
): BitcoinCashServiceConfig => {
  if (value === undefined) return { enabled: false };
  if (!record(value) || typeof value.enabled !== 'boolean') {
    throw new Error('Invalid BCH service configuration');
  }
  if (!value.enabled) return { enabled: false };
  if (!Number.isInteger(assignedChainIndex) || assignedChainIndex < 0 || assignedChainIndex > 255) {
    throw new Error('BCH service requires a Rosen-assigned chain index');
  }
  try {
    if (
      typeof value.lockAddress !== 'string' ||
      !Number.isSafeInteger(value.initialHeight) ||
      (value.initialHeight as number) < 0 ||
      !record(value.rpc) ||
      !record(value.scanner) ||
      !record(value.cleanup) ||
      !record(value.commitment) ||
      !record(value.eventTrigger) ||
      !record(value.electrum) ||
      !Array.isArray(value.calculatorAddresses)
    )
      throw new Error();
    if (!/^76a914[0-9a-f]{40}88ac$/.test(encodeAddress('bitcoin-cash', value.lockAddress)))
      throw new Error();
    if (value.calculatorAddresses.length < 1 || value.calculatorAddresses.length > 100)
      throw new Error();
    const treasuryScripts = value.calculatorAddresses.map((address) => {
      if (typeof address !== 'string') throw new Error();
      return encodeAddress('bitcoin-cash', address);
    });
    if (
      new Set(treasuryScripts).size !== treasuryScripts.length ||
      treasuryScripts.some((script) => !/^76a914[0-9a-f]{40}88ac$/.test(script))
    )
      throw new Error();
    if (
      typeof value.electrum.hostname !== 'string' ||
      !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/.test(value.electrum.hostname) ||
      !positiveInteger(value.electrum.port) ||
      value.electrum.port > 65535 ||
      !positiveInteger(value.electrum.timeoutMs) ||
      value.electrum.timeoutMs > 30000
    )
      throw new Error();
    if (
      typeof value.commitment.address !== 'string' ||
      typeof value.commitment.rwt !== 'string' ||
      !/^[0-9a-fA-F]{64}$/.test(value.commitment.rwt)
    )
      throw new Error();
    validateAddress('ergo', value.commitment.address);
    for (const field of ['address', 'permitAddress', 'fraudAddress'] as const) {
      const address = value.eventTrigger[field];
      if (typeof address !== 'string') throw new Error();
      validateAddress('ergo', address);
    }
    if (
      !positiveInteger(value.cleanup.thresholdSeconds) ||
      !positiveInteger(value.cleanup.trimCount) ||
      value.cleanup.trimCount > 10000
    )
      throw new Error();
    const rpc = value.rpc;
    const scanner = value.scanner;
    if (
      typeof rpc.url !== 'string' ||
      !positiveInteger(rpc.timeoutMs) ||
      rpc.timeoutMs > 120000 ||
      !positiveInteger(scanner.intervalMs) ||
      scanner.intervalMs > 86400000 ||
      !positiveInteger(scanner.warnDiff) ||
      !positiveInteger(scanner.criticalDiff) ||
      scanner.warnDiff > scanner.criticalDiff
    )
      throw new Error();
    const url = validateBitcoinCashRpcUrl(rpc.url);
    const hasUsername = rpc.username !== undefined;
    const hasPassword = rpc.password !== undefined;
    if (hasUsername !== hasPassword) throw new Error();
    validateBitcoinCashRpcCredentials(
      hasUsername
        ? { username: rpc.username as string, password: rpc.password as string }
        : undefined,
    );
    const limits = resolveBitcoinCashRpcLimits(
      rpc.limits as Partial<BitcoinCashRpcLimits> | undefined,
    );
    return {
      enabled: true,
      lockAddress: value.lockAddress.toLowerCase(),
      initialHeight: value.initialHeight as number,
      rpc: {
        url,
        timeoutMs: rpc.timeoutMs,
        username: rpc.username as string | undefined,
        password: rpc.password as string | undefined,
        limits,
      },
      scanner: {
        intervalMs: scanner.intervalMs,
        warnDiff: scanner.warnDiff,
        criticalDiff: scanner.criticalDiff,
      },
      cleanup: {
        thresholdSeconds: value.cleanup.thresholdSeconds,
        trimCount: value.cleanup.trimCount,
      },
      commitment: { address: value.commitment.address, rwt: value.commitment.rwt.toLowerCase() },
      eventTrigger: {
        address: value.eventTrigger.address as string,
        permitAddress: value.eventTrigger.permitAddress as string,
        fraudAddress: value.eventTrigger.fraudAddress as string,
      },
      electrum: {
        hostname: value.electrum.hostname,
        port: value.electrum.port,
        timeoutMs: value.electrum.timeoutMs,
      },
      calculatorAddresses: value.calculatorAddresses.map((address: string) =>
        address.toLowerCase(),
      ),
    };
  } catch {
    throw new Error('Invalid BCH service configuration');
  }
};
