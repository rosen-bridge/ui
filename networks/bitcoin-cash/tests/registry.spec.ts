import { afterEach, describe, expect, it, vi } from 'vitest';

import { isBitcoinCashRouteAvailable } from '../src/registry';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10, key: 'bitcoin-cash' } }));
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
        get key() {
          return candidate.key;
        },
      },
    },
  };
});
afterEach(() => {
  candidate.index = 10;
  candidate.key = 'bitcoin-cash';
});

describe('isBitcoinCashRouteAvailable', () => {
  /**
   * @target isBitcoinCashRouteAvailable accepts only bounded assigned registry entries
   * @dependencies Existing network registry and synthetic assigned BCH entry.
   * @scenario Check known chains; vary the BCH index and key independently;
   * check each result.
   * @expected Permit known assigned chains; reject each unassigned, noninteger or oversized index.
   */
  it('accepts only bounded assigned registry entries', () => {
    expect(isBitcoinCashRouteAvailable('ethereum')).toEqual(true);
    expect(isBitcoinCashRouteAvailable('bitcoin-cash')).toEqual(true);
    for (const index of [-1, 256, 1.5, NaN]) {
      candidate.index = index;
      expect(isBitcoinCashRouteAvailable('bitcoin-cash')).toEqual(false);
    }
    candidate.index = 10;
    candidate.key = 'ethereum';
    expect(isBitcoinCashRouteAvailable('bitcoin-cash')).toEqual(false);
  });
  /**
   * @target isBitcoinCashRouteAvailable rejects unknown keys and inherited object members
   * @dependencies Existing plain-object network registry.
   * @scenario Check unknown, prototype-member and nonstring keys; compare rejection.
   * @expected Reject without reading a prototype entry as a chain.
   */
  it('rejects unknown keys and inherited object members', () => {
    for (const key of ['unknown', '__proto__', 'constructor', 'toString', undefined, 10])
      expect(isBitcoinCashRouteAvailable(key)).toEqual(false);
  });
});
