import { binToHex, cashAddressToLockingBytecode, decodeCashAddress } from '@bitauth/libauth';
import type SignClient from '@walletconnect/sign-client';

import type { BitcoinCashUnsignedLockRequest } from '@rosen-network/bitcoin-cash';

import { createCashonizeSigningRequest, validateCashonizeSigningResponse } from './signing.js';

const CHAIN = 'bch:bitcoincash';
const METHODS = ['bch_getAddresses', 'bch_signTransaction', 'bch_cancelPendingRequests'];
const APPROVED_METHODS = [...METHODS, 'bch_signMessage'];
const DISCONNECT = { code: 6000, message: 'User disconnected.' };
type Client = Pick<SignClient, 'connect' | 'request' | 'disconnect' | 'on' | 'off' | 'session'>;

/** Session authorization snapshot, independent of the relay SDK's static types. */
export interface CashonizeAuthorization {
  readonly topic: string;
  readonly address: string;
  readonly addresses: readonly string[];
  readonly expiry: number;
}

/** Reject non-object untrusted session fields before accessing their properties. */
const record = (value: unknown): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid BCH session object');
  return value as Record<string, unknown>;
};

/** Require a bounded nonempty unique string list for session permissions/accounts. */
const strings = (value: unknown, limit: number): string[] => {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > limit ||
    value.some((item) => typeof item !== 'string') ||
    new Set(value).size !== value.length
  )
    throw new Error('Invalid BCH session list');
  return value;
};

/** Validate canonical ordinary P2PKH CashAddr, excluding token and testnet forms. */
const address = (value: string): string => {
  if (value.length > 100 || !value.startsWith('bitcoincash:') || value !== value.toLowerCase())
    throw new Error('Invalid BCH session address');
  const decoded = cashAddressToLockingBytecode(value);
  const cash = decodeCashAddress(value);
  if (
    typeof cash === 'string' ||
    cash.type !== 'p2pkh' ||
    typeof decoded === 'string' ||
    decoded.prefix !== 'bitcoincash' ||
    !/^76a914[0-9a-f]{40}88ac$/.test(binToHex(decoded.bytecode))
  )
    throw new Error('BCH wallet requires ordinary mainnet P2PKH');
  return value;
};

/** Reject aborted or absolutely overdue operations even before timer callbacks run. */
const checkDeadline = (deadline: number, signal?: AbortSignal): void => {
  if (signal?.aborted) throw new Error('BCH wallet operation cancelled');
  if (Date.now() >= deadline) throw new Error('BCH wallet operation timed out');
};

/**
 * Validate active Cashonize permissions and ordinary mainnet accounts.
 * @param value Untrusted approved or stored session.
 * @param nowMs Current time in milliseconds.
 * @returns Frozen bounded authorization; connection separately requires account selection.
 * @throws For expired sessions, unsupported chains/methods/events or malformed accounts.
 */
export const validateCashonizeSession = (
  value: unknown,
  nowMs = Date.now(),
): CashonizeAuthorization => {
  const session = record(value);
  if (
    typeof session.topic !== 'string' ||
    !/^[0-9a-f]{64}$/.test(session.topic) ||
    typeof session.expiry !== 'number' ||
    !Number.isSafeInteger(session.expiry) ||
    session.expiry <= nowMs / 1000
  )
    throw new Error('Invalid or expired BCH session');
  const namespaces = record(session.namespaces);
  if (Object.keys(namespaces).length !== 1 || !Object.hasOwn(namespaces, 'bch'))
    throw new Error('Unauthorized BCH session namespace');
  const namespace = record(namespaces.bch);
  if (strings(namespace.chains, 1)[0] !== CHAIN) throw new Error('Unauthorized BCH session chain');
  const methods = strings(namespace.methods, APPROVED_METHODS.length);
  if (
    METHODS.some((method) => !methods.includes(method)) ||
    methods.some((method) => !APPROVED_METHODS.includes(method))
  )
    throw new Error('Unauthorized BCH session methods');
  if (strings(namespace.events, 1)[0] !== 'addressesChanged')
    throw new Error('Unauthorized BCH session events');
  const addresses = Object.freeze(
    strings(namespace.accounts, 100).map((account) => {
      if (!account.startsWith(`${CHAIN}:`)) throw new Error('Unauthorized BCH session account');
      return address(account.slice(4));
    }),
  );
  return Object.freeze({
    topic: session.topic,
    expiry: session.expiry,
    address: addresses[0],
    addresses,
  });
};

/**
 * Cashonize session lifecycle over the actual SignClient interface.
 * Every operation has a local deadline; cancellation invalidates late results.
 * This adapter signs only and never calls a wallet broadcast method.
 */
export class CashonizeSession {
  private authorization?: CashonizeAuthorization;
  private generation = 0;
  private busy = false;
  private disposed = false;
  /** Invalidate cached authorization when the active SDK session changes or ends. */
  private readonly invalidate = ({ topic }: { topic: string }) => {
    if (topic === this.authorization?.topic) {
      this.authorization = undefined;
      this.generation++;
    }
  };

  /**
   * Register a bounded native Cashonize lifecycle over the initialized relay SDK.
   * @param client Initialized SignClient; production factory uses the pinned SDK.
   * @param timeoutMs Explicit local operation deadline, from 1 to 30000 milliseconds.
   * @param showUri Display the pairing URI to the user without logging it.
   * @param selectAccount Confirm the first approved account, which pinned Cashonize signs.
   */
  constructor(
    private readonly client: Client,
    private readonly timeoutMs: number,
    private readonly showUri: (uri: string) => void,
    private readonly selectAccount: (addresses: readonly string[]) => Promise<string>,
  ) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000)
      throw new Error('Invalid BCH wallet deadline');
    client.on('session_update', this.invalidate);
    client.on('session_delete', this.invalidate);
    client.on('session_expire', this.invalidate);
    client.on('session_event', this.invalidate);
  }

  /** Await one phase within the shared operation deadline, checking cancellation and elapsed time. */
  private bounded = async <T>(
    pending: Promise<T>,
    deadline: number,
    signal?: AbortSignal,
  ): Promise<T> => {
    void pending.catch(() => undefined);
    checkDeadline(deadline, signal);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let abort: (() => void) | undefined;
    try {
      const result = await Promise.race([
        pending.catch(() => {
          throw new Error('BCH wallet request failed');
        }),
        new Promise<never>((_, reject) => {
          abort = () => reject(new Error('BCH wallet operation cancelled'));
          if (signal?.aborted) {
            abort();
            return;
          }
          signal?.addEventListener('abort', abort, { once: true });
          timer = setTimeout(
            () => reject(new Error('BCH wallet operation timed out')),
            deadline - Date.now(),
          );
        }),
      ]);
      checkDeadline(deadline, signal);
      return result;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (abort) signal?.removeEventListener('abort', abort);
    }
  };

  /** Check local lifecycle before any user prompt, relay call or result acceptance. */
  private active = (generation: number, deadline: number, signal?: AbortSignal): void => {
    if (this.disposed || generation !== this.generation)
      throw new Error('BCH wallet operation cancelled');
    checkDeadline(deadline, signal);
  };

  /** Revalidate the SDK record rather than trusting cached permissions or event delivery alone. */
  private current = (): CashonizeAuthorization => {
    if (this.disposed || !this.authorization) throw new Error('BCH wallet is disconnected');
    let stored: unknown;
    try {
      stored = this.client.session.get(this.authorization.topic);
    } catch {
      throw new Error('BCH wallet is disconnected');
    }
    const current = validateCashonizeSession(stored);
    if (
      current.topic !== this.authorization.topic ||
      current.expiry !== this.authorization.expiry ||
      JSON.stringify(current.addresses) !== JSON.stringify(this.authorization.addresses) ||
      !current.addresses.includes(this.authorization.address)
    )
      throw new Error('BCH session authorization changed');
    return this.authorization;
  };

  /** Return the currently validated address; expired or changed sessions fail closed. */
  getAddress = (): string => this.current().address;

  /** Establish only BCH mainnet permissions; discard and disconnect late approval. */
  connect = async (signal?: AbortSignal): Promise<void> => {
    if (this.disposed || this.busy || signal?.aborted)
      throw new Error('BCH wallet connection unavailable');
    if (this.authorization) {
      this.current();
      return;
    }
    this.busy = true;
    const generation = this.generation;
    const deadline = Date.now() + this.timeoutMs;
    let accepted = false;
    let pendingApproval: ReturnType<Awaited<ReturnType<Client['connect']>>['approval']> | undefined;
    const pendingProposal = this.client.connect({
      requiredNamespaces: {
        bch: { chains: [CHAIN], methods: METHODS, events: ['addressesChanged'] },
      },
    });
    try {
      this.active(generation, deadline, signal);
      const proposal = await this.bounded(pendingProposal, deadline, signal);
      this.active(generation, deadline, signal);
      if (!proposal.uri || proposal.uri.length > 4096 || !proposal.uri.startsWith('wc:'))
        throw new Error('Invalid BCH pairing URI');
      this.showUri(proposal.uri);
      this.active(generation, deadline, signal);
      pendingApproval = proposal.approval();
      const session = await this.bounded(pendingApproval, deadline, signal);
      this.active(generation, deadline, signal);
      const approved = validateCashonizeSession(session);
      this.active(generation, deadline, signal);
      const selected = address(
        await this.bounded(
          this.selectAccount(Object.freeze([approved.addresses[0]])),
          deadline,
          signal,
        ),
      );
      if (selected !== approved.addresses[0])
        throw new Error('BCH selected account is not signable by Cashonize');
      this.active(generation, deadline, signal);
      this.authorization = Object.freeze({ ...approved, address: selected });
      this.current();
      accepted = true;
      this.generation++;
    } finally {
      if (!accepted) {
        this.authorization = undefined;
        this.generation++;
        const lateApproval =
          pendingApproval ?? pendingProposal.then((proposal) => proposal.approval());
        void lateApproval
          .then((session) => this.client.disconnect({ topic: session.topic, reason: DISCONNECT }))
          .catch(() => undefined);
      }
      this.busy = false;
    }
  };

  /** Sign an authenticated native deposit, verifying session and result before returning bytes. */
  sign = async (parameters: BitcoinCashUnsignedLockRequest, signal?: AbortSignal) => {
    if (this.busy || signal?.aborted) throw new Error('BCH wallet signing unavailable');
    const deadline = Date.now() + this.timeoutMs;
    const authorization = this.current();
    if (parameters.fromAddress !== authorization.address)
      throw new Error('BCH signing account mismatch');
    const { intent, request } = createCashonizeSigningRequest(parameters);
    this.busy = true;
    const generation = this.generation;
    try {
      this.active(generation, deadline, signal);
      const addresses = await this.bounded(
        this.client.request({
          topic: authorization.topic,
          chainId: CHAIN,
          request: { method: 'bch_getAddresses', params: {} },
        }),
        deadline,
        signal,
      );
      const returned = strings(addresses, 100).map(address);
      if (
        !returned.includes(authorization.address) ||
        returned.some((entry) => !authorization.addresses.includes(entry))
      )
        throw new Error('BCH wallet address response mismatch');
      this.current();
      this.active(generation, deadline, signal);
      const response = await this.bounded(
        this.client.request({
          topic: authorization.topic,
          chainId: CHAIN,
          request: { method: 'bch_signTransaction', params: request },
        }),
        deadline,
        signal,
      );
      this.current();
      this.active(generation, deadline, signal);
      const checked = validateCashonizeSigningResponse(response, intent);
      this.active(generation, deadline, signal);
      return checked;
    } catch (error) {
      // Cashonize polls queued cancellation requests while its signing dialog is open.
      void this.client
        .request({
          topic: authorization.topic,
          chainId: CHAIN,
          request: { method: 'bch_cancelPendingRequests', params: {} },
        })
        .catch(() => undefined);
      throw error;
    } finally {
      this.busy = false;
    }
  };

  /** Clear local authorization before a bounded remote disconnect. */
  disconnect = async (): Promise<void> => {
    const topic = this.authorization?.topic;
    this.authorization = undefined;
    this.generation++;
    if (topic)
      await this.bounded(
        this.client.disconnect({ topic, reason: DISCONNECT }),
        Date.now() + this.timeoutMs,
      );
  };

  /** Remove listeners and reject future operations without initializing a new connection. */
  dispose = (): void => {
    this.disposed = true;
    this.authorization = undefined;
    this.generation++;
    this.client.off('session_update', this.invalidate);
    this.client.off('session_delete', this.invalidate);
    this.client.off('session_expire', this.invalidate);
    this.client.off('session_event', this.invalidate);
  };
}

/** Initialize the actual pinned relay SDK only when the UI requests a wallet connection. */
export const createCashonizeSession = async (options: {
  projectId: string;
  metadata: NonNullable<Parameters<typeof SignClient.init>[0]>['metadata'];
  timeoutMs: number;
  showUri: (uri: string) => void;
  selectAccount: (addresses: readonly string[]) => Promise<string>;
}) => {
  const deadline = Date.now() + options.timeoutMs;
  if (!/^[0-9a-f]{32}$/.test(options.projectId))
    throw new Error('Invalid WalletConnect project ID');
  if (
    !Number.isSafeInteger(options.timeoutMs) ||
    options.timeoutMs < 1 ||
    options.timeoutMs > 30000
  )
    throw new Error('Invalid BCH wallet deadline');
  if (
    !options.metadata ||
    typeof options.metadata.name !== 'string' ||
    options.metadata.name.trim().length === 0 ||
    options.metadata.name.length > 200 ||
    typeof options.metadata.description !== 'string' ||
    options.metadata.description.length > 1000 ||
    typeof options.metadata.url !== 'string' ||
    options.metadata.url.length > 2048 ||
    !options.metadata.url.startsWith('https://') ||
    !Array.isArray(options.metadata.icons) ||
    options.metadata.icons.length > 10 ||
    options.metadata.icons.some(
      (icon) => typeof icon !== 'string' || icon.length > 2048 || !icon.startsWith('https://'),
    )
  )
    throw new Error('Invalid WalletConnect application metadata');
  const { default: SignClientImplementation } = await import('@walletconnect/sign-client').catch(
    () => {
      throw new Error('BCH wallet SDK unavailable');
    },
  );
  checkDeadline(deadline);
  const pending = SignClientImplementation.init({
    projectId: options.projectId,
    metadata: options.metadata,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let accepted = false;
  try {
    const client = await Promise.race([
      pending.catch(() => {
        throw new Error('BCH wallet initialization failed');
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('BCH wallet initialization timed out')),
          deadline - Date.now(),
        );
      }),
    ]);
    checkDeadline(deadline);
    accepted = true;
    return new CashonizeSession(client, options.timeoutMs, options.showUri, options.selectAccount);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (!accepted)
      void pending.then((client) => client.core.relayer.transportClose()).catch(() => undefined);
  }
};
