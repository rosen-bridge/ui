import { afterEach, describe, expect, it, vi } from 'vitest';

import { signingIntent } from '../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import { validateBitcoinCashStartup } from '../../../src/networks/bitcoin-cash/startup';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
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
    isNetworkAvailable: (key: string) =>
      key === 'bitcoin-cash' ? candidate.index >= 0 : actual.isNetworkAvailable(key),
  };
});

/** Complete explicit synthetic operator settings; no real endpoint is contacted. */
const configuration = () => ({
  enabled: true,
  lockAddress: signingIntent().lockAddress,
  nextHeightInterval: '100',
  walletTimeoutMs: '30000',
  projectId: '12'.repeat(16),
  hostname: 'electrum.example',
  port: '50002',
  timeoutMs: '30000',
  feeRate: '2',
  maxFeeSatoshis: '10000',
  allowedDestinationChains: ['ergo'],
  minimumFeeNFT: '11'.repeat(32),
});

afterEach(() => {
  candidate.index = 10;
});

describe('validateBitcoinCashStartup', () => {
  /**
   * @target Disabled BCH does not require any new operator settings.
   * @dependencies Actual public and server parsers with unassigned source registry.
   * @scenario Disable BCH and omit all generated/public/server values.
   * @expected Permit both server and browser startup without creating provider ports.
   */
  it.each([true, false])('preserves disabled startup server=%s', (isServer) => {
    candidate.index = -1;
    expect(() =>
      validateBitcoinCashStartup(
        {
          enabled: false,
          lockAddress: undefined,
          nextHeightInterval: undefined,
          walletTimeoutMs: undefined,
          projectId: undefined,
        },
        isServer,
      ),
    ).not.toThrow();
  });
  /**
   * @target Enabled server registration requires complete trusted provider and fee configuration.
   * @dependencies Actual parsers and one independently omitted operator field.
   * @scenario Remove hostname, port, timeout, miner fee policy, destination policy or quote NFT.
   * @expected Reject each incomplete enabled server startup before any wallet can be offered.
   */
  it.each([
    'hostname',
    'port',
    'timeoutMs',
    'feeRate',
    'maxFeeSatoshis',
    'allowedDestinationChains',
    'minimumFeeNFT',
  ] as const)('rejects missing server %s', (field) => {
    const config = configuration();
    expect(() => validateBitcoinCashStartup({ ...config, [field]: undefined }, true)).toThrow();
  });
  /**
   * @target Browser startup validates public authority without requiring or exposing server fields.
   * @dependencies Actual public parser and no operator-only values.
   * @scenario Supply valid assigned public settings alone.
   * @expected Permit browser startup and complete explicit server startup.
   */
  it('accepts public-only browser and complete server configuration', () => {
    const config = configuration();
    expect(() =>
      validateBitcoinCashStartup(
        {
          enabled: config.enabled,
          lockAddress: config.lockAddress,
          projectId: config.projectId,
          walletTimeoutMs: config.walletTimeoutMs,
          nextHeightInterval: config.nextHeightInterval,
        },
        false,
      ),
    ).not.toThrow();
    expect(() => validateBitcoinCashStartup(config, true)).not.toThrow();
  });
  /**
   * @target Rosen assignment is required independently of complete operator values.
   * @dependencies Actual public parser with source chain index minus one.
   * @scenario Enable BCH with all explicit values while index remains unassigned.
   * @expected Reject startup for browser and server.
   */
  it.each([true, false])('rejects unassigned startup server=%s', (isServer) => {
    candidate.index = -1;
    expect(() => validateBitcoinCashStartup(configuration(), isServer)).toThrow(
      /^BCH chain index is unassigned$/,
    );
  });
});
