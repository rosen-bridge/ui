import { describe, expect, it } from 'vitest';

import { decodeAddress } from '@rosen-bridge/address-codec';

import { readBitcoinCashConfig } from '../../src/bitcoin-cash/config';

const valid = {
  enabled: true,
  lockAddress: 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  initialHeight: 800000,
  rpc: { url: 'https://example.invalid', timeoutMs: 10000 },
  scanner: { intervalMs: 600000, warnDiff: 3, criticalDiff: 6 },
  cleanup: { thresholdSeconds: 86400, trimCount: 100 },
  commitment: {
    address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    rwt: '11'.repeat(32),
  },
  eventTrigger: {
    address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    permitAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    fraudAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  },
  electrum: { hostname: 'example.invalid', port: 50002, timeoutMs: 30000 },
  calculatorAddresses: ['bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a'],
};
const fixtureIndex = 10;

describe('readBitcoinCashConfig', () => {
  /**
   * @target readBitcoinCashConfig: Missing or explicitly disabled BCH configuration preserves existing startup.
   * @dependencies Shared registry.
   * @scenario Read absence or disabled configuration containing unfinished operator values.
   * @expected Disabled result without invented endpoints, addresses, or thresholds.
   */
  it.each([undefined, { enabled: false }, { enabled: false, rpc: null }])(
    'keeps BCH disabled %#',
    (value) => {
      expect(readBitcoinCashConfig(value)).toEqual({ enabled: false });
    },
  );

  /**
   * @target readBitcoinCashConfig: BCH startup requires Rosen index assignment.
   * @dependencies Actual shared registry and independently invalid index fixtures.
   * @scenario Request enablement before assignment or with invalid index values.
   * @expected Reject prior to constructing any network client.
   */
  it.each([undefined, -1, 256, 1.5, Number.NaN])(
    'rejects an unassigned or invalid index %#',
    (index) => {
      expect(() => readBitcoinCashConfig(valid, index)).toThrow('Rosen-assigned chain index');
    },
  );

  /**
   * @target readBitcoinCashConfig: Valid operator values retain exact millisecond units.
   * @dependencies Shared CashAddr codec; assigned fixture index.
   * @scenario Read complete configuration with uppercase native mainnet address and paired RPC credentials.
   * @expected Canonical address, unchanged timeout and no registry modification.
   */
  it('accepts complete operator configuration with a fixture assignment', () => {
    const config = readBitcoinCashConfig(
      {
        ...valid,
        lockAddress: valid.lockAddress.toUpperCase(),
        rpc: { ...valid.rpc, username: 'operator', password: 'synthetic' },
      },
      fixtureIndex,
    );
    expect(config).toEqual({
      ...valid,
      rpc: { ...valid.rpc, username: 'operator', password: 'synthetic' },
    });
  });

  /**
   * @target readBitcoinCashConfig: Each configuration field rejects malformed values independently.
   * @dependencies Assigned fixture index and shared address codec.
   * @scenario Change one required field, RPC policy, or scanner threshold at a time.
   * @expected A fixed error without exposing operator endpoint or credential text.
   */
  it.each([
    null,
    {},
    { ...valid, enabled: 'true' },
    { ...valid, lockAddress: 'invalid' },
    { ...valid, initialHeight: -1 },
    { ...valid, initialHeight: 1.5 },
    { ...valid, rpc: null },
    { ...valid, rpc: { ...valid.rpc, timeoutMs: 0 } },
    { ...valid, rpc: { ...valid.rpc, timeoutMs: 120001 } },
    { ...valid, rpc: { ...valid.rpc, url: 'ftp://example.invalid' } },
    { ...valid, rpc: { ...valid.rpc, url: 'https://secret:synthetic@example.invalid' } },
    { ...valid, rpc: { ...valid.rpc, url: 'https://example.invalid/#private' } },
    { ...valid, rpc: { ...valid.rpc, username: 'operator' } },
    { ...valid, rpc: { ...valid.rpc, username: '', password: '' } },
    { ...valid, scanner: null },
    { ...valid, scanner: { ...valid.scanner, intervalMs: 0 } },
    { ...valid, scanner: { ...valid.scanner, intervalMs: 86400001 } },
    { ...valid, scanner: { ...valid.scanner, warnDiff: 0 } },
    { ...valid, scanner: { ...valid.scanner, criticalDiff: 2 } },
    { ...valid, cleanup: undefined },
    { ...valid, cleanup: { ...valid.cleanup, thresholdSeconds: 0 } },
    { ...valid, cleanup: { ...valid.cleanup, trimCount: 0 } },
    { ...valid, cleanup: { ...valid.cleanup, trimCount: 10001 } },
    { ...valid, commitment: undefined },
    { ...valid, commitment: { ...valid.commitment, address: 'invalid' } },
    { ...valid, commitment: { ...valid.commitment, rwt: 'invalid' } },
    { ...valid, eventTrigger: undefined },
    { ...valid, eventTrigger: { ...valid.eventTrigger, address: 'invalid' } },
    { ...valid, eventTrigger: { ...valid.eventTrigger, permitAddress: 'invalid' } },
    { ...valid, eventTrigger: { ...valid.eventTrigger, fraudAddress: 'invalid' } },
    { ...valid, electrum: undefined },
    { ...valid, electrum: { ...valid.electrum, hostname: 'https://example.invalid' } },
    { ...valid, electrum: { ...valid.electrum, port: 0 } },
    { ...valid, electrum: { ...valid.electrum, port: 65536 } },
    { ...valid, electrum: { ...valid.electrum, timeoutMs: 0 } },
    { ...valid, electrum: { ...valid.electrum, timeoutMs: 30001 } },
    { ...valid, electrum: { ...valid.electrum, timeoutMs: undefined } },
    { ...valid, calculatorAddresses: [] },
    { ...valid, calculatorAddresses: Array(101).fill(valid.lockAddress) },
    { ...valid, calculatorAddresses: [valid.lockAddress, valid.lockAddress.toUpperCase()] },
    { ...valid, calculatorAddresses: ['invalid'] },
    { ...valid, lockAddress: decodeAddress('bitcoin-cash', `a914${'00'.repeat(20)}87`) },
    { ...valid, calculatorAddresses: [decodeAddress('bitcoin-cash', `a914${'00'.repeat(20)}87`)] },
  ])('rejects malformed explicit configuration %#', (value) => {
    expect(() => readBitcoinCashConfig(value, fixtureIndex)).toThrow(
      /^Invalid BCH service configuration$/,
    );
  });
});
