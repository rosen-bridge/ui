import { describe, expect, it, vi } from 'vitest';

import { BitcoinCashPairing } from '../../../src/networks/bitcoin-cash/pairing';

/** Presentation primitive only; session authorization separately validates real CashAddr identity. */
const ADDRESS = 'bitcoincash:fixture';

describe('BitcoinCashPairing', () => {
  describe('begin', () => {
    /**
     * @target Presentation callbacks belong to exactly one connection attempt.
     * @dependencies Real pairing store and local cancellation callback.
     * @scenario Cancel an attempt then invoke its delayed URI/account callbacks.
     * @expected Reject stale callbacks and keep the presentation empty.
     */
    it('invalidates late presentation callbacks on cancellation', async () => {
      const pairing = new BitcoinCashPairing();
      const cancel = vi.fn(async () => undefined);
      const attempt = pairing.begin(cancel);
      attempt.showUri('wc:fixture');
      await pairing.cancel();
      expect(cancel).toHaveBeenCalledOnce();
      expect(() => attempt.showUri('wc:late')).toThrow(/^BCH pairing cancelled$/);
      expect(() => attempt.selectAccount([ADDRESS])).toThrow(/^BCH pairing cancelled$/);
      expect(pairing.getSnapshot()).toEqual({});
    });
    /**
     * @target A previous attempt cannot clear a newer attempt's presentation.
     * @dependencies Two real attempt leases and a pending account selection.
     * @scenario Start a second attempt while first account confirmation is pending.
     * @expected Reject the previous selection and retain the second URI after old finish.
     */
    it('preserves the newer attempt after stale cleanup', async () => {
      const pairing = new BitcoinCashPairing();
      const first = pairing.begin(async () => undefined);
      const selection = first.selectAccount([ADDRESS]);
      const rejected = expect(selection).rejects.toThrow(/^BCH pairing cancelled$/);
      const second = pairing.begin(async () => undefined);
      await rejected;
      second.showUri('wc:second');
      first.finish();
      expect(pairing.getSnapshot()).toEqual({ uri: 'wc:second' });
    });
  });
  describe('confirm', () => {
    /**
     * @target Account authorization requires explicit UI confirmation.
     * @dependencies Real pairing store and subscriber.
     * @scenario Display one approved account then confirm it.
     * @expected Resolve exactly that account, clear presentation and remove the subscriber.
     */
    it('resolves the presented account only on confirmation', async () => {
      const pairing = new BitcoinCashPairing();
      const listener = vi.fn();
      const unsubscribe = pairing.subscribe(listener);
      const attempt = pairing.begin(async () => undefined);
      const selection = attempt.selectAccount([ADDRESS]);
      expect(pairing.getSnapshot()).toEqual({ address: ADDRESS });
      pairing.confirm();
      expect(await selection).toEqual(ADDRESS);
      expect(pairing.getSnapshot()).toEqual({});
      unsubscribe();
      listener.mockClear();
      attempt.finish();
      expect(listener).not.toHaveBeenCalled();
      expect(() => pairing.confirm()).toThrow(/^BCH pairing account unavailable$/);
    });
  });
  describe('cancel', () => {
    /**
     * @target Cancellation clears presentation even when wallet cleanup fails.
     * @dependencies Real pending confirmation and failing local cleanup callback.
     * @scenario Cancel an approved account prompt and reject remote cleanup.
     * @expected Reject selection with fixed text and retain no URI or account.
     */
    it('rejects pending selection before failing cleanup', async () => {
      const pairing = new BitcoinCashPairing();
      const attempt = pairing.begin(async () => {
        throw new Error('private SDK detail');
      });
      const selected = attempt.selectAccount([ADDRESS]);
      const rejected = expect(selected).rejects.toThrow(/^BCH pairing cancelled$/);
      await pairing.cancel();
      await rejected;
      expect(pairing.getSnapshot()).toEqual({});
    });
  });
});
