/** Public pairing presentation; the URI is displayed only for the active connection attempt. */
export interface BitcoinCashPairingState {
  readonly uri?: string;
  readonly address?: string;
}

/** Isolate pairing UI callbacks from stale proposals, cancellations and previous account prompts. */
export class BitcoinCashPairing {
  private generation = 0;
  private state: BitcoinCashPairingState = Object.freeze({});
  private listeners = new Set<() => void>();
  private pending?: { resolve(address: string): void; reject(error: Error): void };
  private cancelConnection?: () => Promise<void>;

  /** Return an immutable snapshot suitable for React's external-store subscription. */
  getSnapshot = (): BitcoinCashPairingState => this.state;

  /** Register a presentation listener and return its exact removal callback. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Publish only bounded primitive state and notify active presentation subscribers. */
  private publish = (state: BitcoinCashPairingState): void => {
    this.state = Object.freeze(state);
    for (const listener of this.listeners) listener();
  };

  /** Invalidate pending selection and erase pairing material before starting another attempt. */
  private clear = (): void => {
    this.generation++;
    this.pending?.reject(new Error('BCH pairing cancelled'));
    this.pending = undefined;
    this.cancelConnection = undefined;
    this.publish({});
  };

  /** Create callbacks owned by one lazy wallet connection; stale callbacks cannot reopen the dialog. */
  begin = (cancelConnection: () => Promise<void>) => {
    this.clear();
    const generation = this.generation;
    this.cancelConnection = cancelConnection;
    /** Reject callbacks belonging to an invalidated attempt. */
    const active = () => {
      if (generation !== this.generation) throw new Error('BCH pairing cancelled');
    };
    return Object.freeze({
      /** Display the already authorized SDK pairing URI without logging or navigating to it. */
      showUri: (uri: string): void => {
        active();
        if (!uri.startsWith('wc:') || uri.length > 4096) throw new Error('Invalid BCH pairing URI');
        this.publish({ uri });
      },
      /** Await explicit confirmation of the single first account offered by the session adapter. */
      selectAccount: (addresses: readonly string[]): Promise<string> => {
        active();
        if (
          this.pending ||
          addresses.length !== 1 ||
          !addresses[0].startsWith('bitcoincash:') ||
          addresses[0].length > 100
        )
          throw new Error('Invalid BCH pairing account');
        const address = addresses[0];
        const selection = new Promise<string>((resolve, reject) => {
          this.pending = { resolve, reject };
        });
        this.publish({ address });
        return selection;
      },
      /** Erase presentation after success/failure without clearing a later connection attempt. */
      finish: (): void => {
        if (generation === this.generation) this.clear();
      },
    });
  };

  /** Confirm only the currently displayed account; the session still validates its source identity. */
  confirm = (): void => {
    const address = this.state.address;
    const pending = this.pending;
    if (!address || !pending) throw new Error('BCH pairing account unavailable');
    this.pending = undefined;
    this.publish({});
    pending.resolve(address);
  };

  /** Clear UI authority first, then invalidate the wallet connection without exposing SDK diagnostics. */
  cancel = async (): Promise<void> => {
    const cancelConnection = this.cancelConnection;
    this.clear();
    try {
      await cancelConnection?.();
    } catch {
      // Local cancellation already invalidated all presentation callbacks.
    }
  };
}

/** Shared presentation store for the single Cashonize connection offered by the app registry. */
export const bitcoinCashPairing = new BitcoinCashPairing();
