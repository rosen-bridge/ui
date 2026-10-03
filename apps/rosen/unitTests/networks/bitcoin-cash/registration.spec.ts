import { afterEach, describe, expect, it, vi } from 'vitest';

import { withBitcoinCash } from '../../../src/networks/bitcoin-cash/registration';

const { state } = vi.hoisted(() => ({ state: { assigned: false } }));
vi.mock('@rosen-ui/constants', () => ({ isNetworkAvailable: () => state.assigned }));
afterEach(() => {
  state.assigned = false;
});

describe('withBitcoinCash', () => {
  /**
   * @target Optional app construction preserves every legacy registry consumer and disabled BCH availability.
   * @dependencies Existing Bitcoin/EVM/Ergo instance identities and explicit optional candidate.
   * @scenario Independently omit configuration, omit assignment or supply both.
   * @expected Keep legacy object identities and append BCH only when both prerequisites are supplied.
   */
  it.each(['config', 'index', 'enabled'])('preserves legacy registration for %s', (stateName) => {
    const bitcoin = { name: 'bitcoin' };
    const ethereum = { name: 'ethereum' };
    const ergo = { name: 'ergo' };
    const bitcoinCash = { name: 'bitcoin-cash' };
    const legacy = { bitcoin, ethereum, ergo };
    state.assigned = stateName !== 'index';
    const result = withBitcoinCash(legacy, stateName === 'config' ? undefined : bitcoinCash);
    expect(result.bitcoin).toBe(bitcoin);
    expect(result.ethereum).toBe(ethereum);
    expect(result.ergo).toBe(ergo);
    expect(Object.keys(result)).toEqual(
      stateName === 'enabled'
        ? ['bitcoin', 'ethereum', 'ergo', 'bitcoinCash']
        : ['bitcoin', 'ethereum', 'ergo'],
    );
    expect(Object.isFrozen(result)).toEqual(true);
    expect(Object.keys(legacy)).toEqual(['bitcoin', 'ethereum', 'ergo']);
  });
});
