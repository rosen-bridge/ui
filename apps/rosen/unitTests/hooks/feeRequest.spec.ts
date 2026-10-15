import { FeeRequestTracker, getFeeRouteKey } from '@/hooks/feeRequest';

const ergoToEthereum = { source: 'ergo', target: 'ethereum', tokenId: 'token-1' };
const ergoToBinance = { source: 'ergo', target: 'binance', tokenId: 'token-1' };

describe('feeRequest', () => {
  describe('getFeeRouteKey', () => {
    /**
     * @target getFeeRouteKey should produce different keys for routes that
     * share a token but differ in target
     * @dependencies
     * @scenario
     * - build keys for the same token on two different targets
     * @expected
     * - the keys are different, so a fee fetched for one target can never be
     *   accepted as the fee of the other
     */
    it('should produce different keys for different targets with the same token', () => {
      expect(getFeeRouteKey(ergoToEthereum)).not.toEqual(getFeeRouteKey(ergoToBinance));
    });

    /**
     * @target getFeeRouteKey should produce different keys for routes that
     * differ in source or token, and the same key for the same route
     * @dependencies
     * @scenario
     * - build keys for routes differing in source, then in token, then an
     *   identical route
     * @expected
     * - source and token changes change the key; an identical route keeps it
     */
    it('should change with the source or token and stay stable for the same route', () => {
      const key = getFeeRouteKey(ergoToEthereum);

      expect(getFeeRouteKey({ ...ergoToEthereum, source: 'cardano' })).not.toEqual(key);
      expect(getFeeRouteKey({ ...ergoToEthereum, tokenId: 'token-2' })).not.toEqual(key);
      expect(getFeeRouteKey({ ...ergoToEthereum })).toEqual(key);
    });
  });

  describe('FeeRequestTracker', () => {
    /**
     * @target FeeRequestTracker.begin should deduplicate a request for the
     * route that is already in flight
     * @dependencies
     * @scenario
     * - begin a request for a route
     * - begin another request for the same route before the first completes
     * @expected
     * - the second begin returns undefined, so no duplicate request is made
     */
    it('should deduplicate a request for the route already in flight', () => {
      const tracker = new FeeRequestTracker();
      const key = getFeeRouteKey(ergoToEthereum);

      const first = tracker.begin(key);

      expect(first).toBeDefined();
      expect(tracker.begin(key)).toBeUndefined();
    });

    /**
     * @target FeeRequestTracker should let a request for a new route start
     * while another route's request is still in flight, and should mark the
     * older request as superseded
     * @dependencies
     * @scenario
     * - begin a request for the ethereum route
     * - begin a request for the binance route before the first completes
     * @expected
     * - the second begin returns an id, the first request is no longer the
     *   latest and the second one is
     */
    it('should start a request for a new route while another is in flight and supersede it', () => {
      const tracker = new FeeRequestTracker();

      const first = tracker.begin(getFeeRouteKey(ergoToEthereum))!;
      const second = tracker.begin(getFeeRouteKey(ergoToBinance))!;

      expect(second).toBeDefined();
      expect(tracker.isLatest(first)).toEqual(false);
      expect(tracker.isLatest(second)).toEqual(true);
    });

    /**
     * @target FeeRequestTracker should start a fresh request when the user
     * returns to a route whose earlier request is still in flight but no
     * longer the latest
     * @dependencies
     * @scenario
     * - begin a request for the ethereum route, then one for binance, then
     *   one for ethereum again, all before any of them completes
     * - complete the stale first ethereum request
     * @expected
     * - the third begin returns a new id (it is not deduplicated against the
     *   stale request) and completing the stale request does not clear the
     *   fresh one, so a repeated begin is still deduplicated
     */
    it('should restart a route whose in-flight request was superseded', () => {
      const tracker = new FeeRequestTracker();
      const ethereumKey = getFeeRouteKey(ergoToEthereum);

      const stale = tracker.begin(ethereumKey)!;
      tracker.begin(getFeeRouteKey(ergoToBinance));
      const fresh = tracker.begin(ethereumKey)!;

      expect(fresh).toBeDefined();
      expect(fresh).not.toEqual(stale);
      expect(tracker.isLatest(fresh)).toEqual(true);

      tracker.complete(stale, ethereumKey);

      expect(tracker.begin(ethereumKey)).toBeUndefined();
    });

    /**
     * @target FeeRequestTracker.complete should allow a new request for the
     * same route once the previous one has finished
     * @dependencies
     * @scenario
     * - begin and complete a request for a route
     * - begin another request for the same route
     * @expected
     * - the second begin returns a new id and is the latest request
     */
    it('should allow a new request after the previous one completes', () => {
      const tracker = new FeeRequestTracker();
      const key = getFeeRouteKey(ergoToEthereum);

      const first = tracker.begin(key)!;
      tracker.complete(first, key);
      const second = tracker.begin(key)!;

      expect(second).toBeDefined();
      expect(second).not.toEqual(first);
      expect(tracker.isLatest(second)).toEqual(true);
    });
  });
});
