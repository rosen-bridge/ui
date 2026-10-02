import { encodeCashAddress, hexToBin, lockingBytecodeToCashAddress } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { signingIntent } from '../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import {
  parseBitcoinCashPublicConfig,
  parseBitcoinCashServerConfig,
} from '../../../src/networks/bitcoin-cash/config';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    isNetworkAvailable: (key: string) =>
      key === 'bitcoin-cash' ? candidate.index >= 0 : actual.isNetworkAvailable(key),
  };
});
/** Explicit synthetic operator configuration; none of these test values are app defaults. */
const fixture = () => ({
  public: {
    enabled: true,
    lockAddress: signingIntent().lockAddress,
    nextHeightInterval: '1',
    walletTimeoutMs: '30000',
    projectId: '11'.repeat(16),
  },
  server: {
    hostname: 'electrum.example.org',
    port: '50002',
    timeoutMs: '30000',
    feeRate: '2',
    maxFeeSatoshis: '10000',
    allowedDestinationChains: ['ergo'],
    minimumFeeNFT: '22'.repeat(32),
  },
});
afterEach(() => {
  candidate.index = 10;
});

describe('parseBitcoinCashPublicConfig', () => {
  /**
   * @target Disabled configuration and unassigned chain cannot activate app networks or wallets.
   * @dependencies Explicit enable flag and real unassigned registry value.
   * @scenario Disable with all operator fields absent, then enable while the index is unassigned.
   * @expected Disabled returns no configuration; enabled rejects unassigned chain.
   */
  it('preserves disabled defaults and rejects an unassigned index', () => {
    const { public: input } = fixture();
    candidate.index = -1;
    expect(
      parseBitcoinCashPublicConfig({
        enabled: false,
        lockAddress: undefined,
        nextHeightInterval: undefined,
        walletTimeoutMs: undefined,
        projectId: undefined,
      }),
    ).toEqual(undefined);
    expect(() => parseBitcoinCashPublicConfig(input)).toThrow('unassigned');
  });
  /**
   * @target Public configuration contains only validated treasury and wallet settings.
   * @dependencies Complete explicit operator fields.
   * @scenario Parse canonical mainnet P2PKH and bounded timing/project values.
   * @expected Return immutable public fields with no endpoint or credential fields.
   */
  it('returns only explicit public settings', () => {
    const { public: input } = fixture();
    expect(parseBitcoinCashPublicConfig(input)).toEqual({
      lockAddress: input.lockAddress,
      nextHeightInterval: 1,
      walletTimeoutMs: 30000,
      projectId: input.projectId,
    });
  });
  /**
   * @target Public settings reject invalid custody and unbounded wallet settings.
   * @dependencies Independent treasury, interval, deadline or project mutation.
   * @scenario Change each mandatory field alone, including token-aware and P2SH addresses.
   * @expected Reject each malformed field without filling defaults.
   */
  it.each([
    'address',
    'token',
    'p2sh',
    'checksum',
    'uppercase',
    'prefix',
    'hash-length',
    'interval',
    'timeout',
    'project',
  ])('rejects public %s', (mutation) => {
    const { public: input } = fixture();
    if (mutation === 'address') input.lockAddress = 'bchtest:qinvalid';
    if (mutation === 'checksum') {
      const last = input.lockAddress.at(-1);
      input.lockAddress = `${input.lockAddress.slice(0, -1)}${last === 'q' ? 'p' : 'q'}`;
    }
    if (mutation === 'uppercase') input.lockAddress = input.lockAddress.toUpperCase();
    if (mutation === 'prefix' || mutation === 'hash-length') {
      const encoded = encodeCashAddress({
        prefix: mutation === 'prefix' ? 'bchtest' : 'bitcoincash',
        type: 'p2pkh',
        payload: hexToBin('22'.repeat(mutation === 'hash-length' ? 32 : 20)),
      });
      if (typeof encoded === 'string') throw new Error(encoded);
      input.lockAddress = encoded.address;
    }
    if (mutation === 'token' || mutation === 'p2sh') {
      const address = lockingBytecodeToCashAddress({
        bytecode: hexToBin(
          mutation === 'p2sh' ? `a914${'22'.repeat(20)}87` : `76a914${'22'.repeat(20)}88ac`,
        ),
        prefix: 'bitcoincash',
        tokenSupport: mutation === 'token',
      });
      if (typeof address === 'string') throw new Error(address);
      input.lockAddress = address.address;
    }
    if (mutation === 'interval') input.nextHeightInterval = '0';
    if (mutation === 'timeout') input.walletTimeoutMs = '30001';
    if (mutation === 'project') input.projectId = 'unset';
    expect(() => parseBitcoinCashPublicConfig(input)).toThrow(/^Invalid BCH app configuration$/);
  });
});
describe('parseBitcoinCashServerConfig', () => {
  /**
   * @target Server-only inputs are ignored while public activation is disabled.
   * @dependencies Absent public settings and entirely absent server inputs.
   * @scenario Parse disabled configuration with no provider or quote defaults.
   * @expected Return no active server configuration.
   */
  it('keeps server disabled without inventing settings', () => {
    expect(
      parseBitcoinCashServerConfig(undefined, {
        hostname: undefined,
        port: undefined,
        timeoutMs: undefined,
        feeRate: undefined,
        maxFeeSatoshis: undefined,
        allowedDestinationChains: undefined,
        minimumFeeNFT: undefined,
      }),
    ).toEqual(undefined);
  });
  /**
   * @target Server policy uses an explicit endpoint and the same validated treasury as the browser.
   * @dependencies Canonical operator config with bounded decimal amount.
   * @scenario Parse enabled settings and inspect endpoint/fee policy.
   * @expected Produce immutable numeric endpoint and exact raw max fee with no fallback values.
   */
  it('constructs explicit immutable server policy', () => {
    const input = fixture();
    const result = parseBitcoinCashServerConfig(
      parseBitcoinCashPublicConfig(input.public),
      input.server,
    );
    expect(result?.electrum).toEqual({
      hostname: input.server.hostname,
      port: 50002,
      timeoutMs: 30000,
    });
    expect(result?.policy).toEqual({
      lockAddress: input.public.lockAddress,
      feeRate: 2,
      maxFee: 10000n,
      allowedDestinationChains: ['ergo'],
    });
    expect(Object.isFrozen(result?.policy.allowedDestinationChains)).toEqual(true);
  });
  /**
   * @target Every operator-owned endpoint/quote/policy field remains required and bounded.
   * @dependencies One independent invalid server field.
   * @scenario Replace hostname, port, timeout, fee rate, max fee, destination list or quote NFT.
   * @expected Reject instead of creating an implicit live configuration.
   */
  it.each(['host', 'port', 'timeout', 'rate', 'maxFee', 'routes', 'duplicate', 'nft'])(
    'rejects server %s',
    (mutation) => {
      const input = fixture();
      if (mutation === 'host') input.server.hostname = 'https://credential@example.org';
      if (mutation === 'port') input.server.port = '65536';
      if (mutation === 'timeout') input.server.timeoutMs = '30001';
      if (mutation === 'rate') input.server.feeRate = '0';
      if (mutation === 'maxFee') input.server.maxFeeSatoshis = '2100000000000001';
      if (mutation === 'routes') input.server.allowedDestinationChains = ['unknown'];
      if (mutation === 'duplicate') input.server.allowedDestinationChains = ['ergo', 'ergo'];
      if (mutation === 'nft') input.server.minimumFeeNFT = '';
      expect(() =>
        parseBitcoinCashServerConfig(parseBitcoinCashPublicConfig(input.public), input.server),
      ).toThrow(/^Invalid BCH app configuration$/);
    },
  );
});
