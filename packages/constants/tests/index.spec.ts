import { describe, expect, it } from 'vitest';

import { isNetworkAvailable, NETWORKS, NETWORKS_KEYS } from '../src';

describe('isNetworkAvailable', () => {
  /**
   * @target Keep the BCH registry entry unavailable while its index is unassigned.
   * @dependencies None.
   * @scenario Inspect the BCH entry and query availability and operational keys.
   * @expected Native-only BCH exists at -1, is unavailable and is not selectable.
   */
  it('keeps BCH unavailable while its Rosen index is unassigned', () => {
    expect(NETWORKS['bitcoin-cash']).toEqual({
      index: -1,
      key: 'bitcoin-cash',
      label: 'Bitcoin Cash',
      nativeToken: 'bch',
      id: '',
      hasTokenSupport: false,
    });
    expect(isNetworkAvailable('bitcoin-cash')).toEqual(false);
    expect(NETWORKS_KEYS).not.toContain('bitcoin-cash');
  });

  /**
   * @target Preserve every prior network index and operational selection key.
   * @dependencies None.
   * @scenario Compare all nine baseline keys and indexes with the registry.
   * @expected No baseline network is removed, renumbered or disabled.
   */
  it('preserves the existing network indexes and selections', () => {
    const indexes = {
      binance: 4,
      bitcoin: 2,
      'bitcoin-runes': 6,
      cardano: 1,
      ergo: 0,
      ethereum: 3,
      doge: 5,
      firo: 7,
      handshake: 8,
    };
    expect(NETWORKS_KEYS).toEqual(Object.keys(indexes));
    for (const [key, index] of Object.entries(indexes)) {
      expect(isNetworkAvailable(key)).toEqual(true);
      expect(NETWORKS[key as keyof typeof NETWORKS].index).toEqual(index);
    }
  });

  /**
   * @target Reject unrecognized keys including Object prototype property names.
   * @dependencies None.
   * @scenario Query empty, unknown and prototype keys independently.
   * @expected False for each key without throwing or reading inherited entries.
   */
  it.each(['', 'unknown', '__proto__', 'constructor', 'toString'])(
    'rejects unavailable key %s',
    (key) => {
      expect(isNetworkAvailable(key)).toEqual(false);
    },
  );
});
