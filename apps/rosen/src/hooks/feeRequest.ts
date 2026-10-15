/**
 * identity and request coordination for transaction fee quotes
 *
 * a fee quote is only valid for the exact route it was fetched for, so
 * requests are keyed by the full route (source, target and token) instead
 * of the token alone, and a response may only be published while its
 * request is still the most recently started one
 */

export type FeeRoute = {
  source: string;
  target: string;
  tokenId: string;
};

export const getFeeRouteKey = (route: FeeRoute): string =>
  [route.source, route.target, route.tokenId].join(':');

export class FeeRequestTracker {
  private sequence = 0;

  private latestId = 0;

  private readonly inFlightByKey = new Map<string, number>();

  /**
   * registers a new fee request for a route and returns its id, or
   * undefined when the request currently in flight for that same route is
   * still the latest one and can be reused instead of duplicated
   */
  begin = (key: string): number | undefined => {
    const inFlight = this.inFlightByKey.get(key);

    if (inFlight !== undefined && inFlight === this.latestId) return undefined;

    const id = ++this.sequence;

    this.latestId = id;

    this.inFlightByKey.set(key, id);

    return id;
  };

  /**
   * whether the given request is still the most recently started one;
   * responses of superseded requests must be discarded, because their
   * route or fee config may no longer be the one shown in the form
   */
  isLatest = (id: number): boolean => id === this.latestId;

  /**
   * marks a request as finished so a later request for the same route can
   * start; completing a superseded request does not clear the fresher
   * request that replaced it for that route
   */
  complete = (id: number, key: string): void => {
    if (this.inFlightByKey.get(key) === id) {
      this.inFlightByKey.delete(key);
    }
  };
}
