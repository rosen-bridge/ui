import { describe, expect, it, vi } from 'vitest';

import { CashonizePairing } from '../src/pairing';

/** Presentation primitive only; session authorization separately validates real CashAddr identity. */
const ADDRESS = 'bitcoincash:fixture';

describe('CashonizePairing', () => {
  describe('begin', () => {
    /**
     * @target CashonizePairing.begin invalidates late presentation callbacks on
     * cancellation
     * @dependencies Real pairing store and local cancellation callback.
     * @scenario
     * - Begin an attempt and show its URI
     * - Cancel
     * - Call stale presentation callbacks
     * - Check rejection and empty state.
     * @expected Reject stale callbacks and keep the presentation empty.
     */
    it('invalidates late presentation callbacks on cancellation', async () => {
      const pairing = new CashonizePairing();
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
     * @target CashonizePairing.begin preserves the newer attempt after stale
     * cleanup
     * @dependencies Two real attempt leases and a pending account selection.
     * @scenario
     * - Begin an attempt with pending selection
     * - Begin a second attempt
     * - Inspect first-selection rejection
     * - Show a new URI and finish the old attempt
     * - Inspect retained state.
     * @expected Reject the previous selection and retain the second URI after
     *   old finish.
     */
    it('preserves the newer attempt after stale cleanup', async () => {
      const pairing = new CashonizePairing();
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
     * @target CashonizePairing.confirm resolves the presented account only on
     * confirmation
     * @dependencies Real pairing store and subscriber.
     * @scenario
     * - Subscribe
     * - Begin and select an account
     * - Confirm
     * - Inspect selected account and cleared state
     * - Unsubscribe and finish
     * - Check no notification and unavailable confirmation.
     * @expected Resolve exactly that account, clear presentation and remove the
     *   subscriber.
     */
    it('resolves the presented account only on confirmation', async () => {
      const pairing = new CashonizePairing();
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
     * @target CashonizePairing.cancel rejects pending selection before failing
     * cleanup
     * @dependencies Real pending confirmation and failing local cleanup
     *   callback.
     * @scenario
     * - Begin with failing cleanup
     * - Start account selection
     * - Cancel
     * - Inspect selection rejection and cleared presentation.
     * @expected Reject selection with fixed text and retain no URI or account.
     */
    it('rejects pending selection before failing cleanup', async () => {
      const pairing = new CashonizePairing();
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
