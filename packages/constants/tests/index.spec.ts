import { describe, expect, it } from 'vitest';

import { NETWORKS, NETWORKS_KEYS } from '../src';

describe('NETWORKS', () => {
  /**
   * @target NETWORKS keeps BCH identity unassigned in the registry
   * @dependencies None.
   * @scenario Inspect the BCH entry and its registration key.
   * @expected Native-only BCH exists at -1 pending Rosen's assignment.
   */
  it('keeps BCH identity unassigned in the registry', () => {
    expect(NETWORKS['bitcoin-cash']).toEqual({
      index: -1,
      key: 'bitcoin-cash',
      label: 'Bitcoin Cash',
      nativeToken: 'bch',
      id: '',
      hasTokenSupport: false,
    });
    expect(NETWORKS_KEYS).toContain('bitcoin-cash');
  });

  /**
   * @target NETWORKS preserves the existing network indexes and registration keys
   * @dependencies None.
   * @scenario Compare all prior keys and indexes with the registry.
   * @expected No baseline network is removed, renumbered or disabled.
   */
  it('preserves the existing network indexes and registration keys', () => {
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
    expect(NETWORKS_KEYS.filter((key) => key !== 'bitcoin-cash')).toEqual(Object.keys(indexes));
    for (const [key, index] of Object.entries(indexes)) {
      expect(NETWORKS[key as keyof typeof NETWORKS].index).toEqual(index);
    }
  });
});
