import { hashTransaction, hexToBin, lockingBytecodeToCashAddress } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  parentOutput,
  signIntent,
  signingIntent,
} from '../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import { CashonizeSession, createCashonizeSession, validateCashonizeSession } from '../src/session';

/** Build native request parameters matching the real authenticated fixture builder. */
const parameters = () => {
  const intent = signingIntent();
  return {
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
    amount: intent.amount,
    feeRate: 2,
    maxFee: 10000n,
    toChain: 'ethereum',
    toAddress: `0x${'12'.repeat(20)}`,
    bridgeFee: 100n,
    networkFee: 100n,
    utxos: [parentOutput(1)],
  };
};
/** Model pinned Cashonize's mainnet namespace and first-account signing authorization. */
const approved = () => ({
  topic: 'ab'.repeat(32),
  expiry: Math.floor(Date.now() / 1000) + 3600,
  namespaces: {
    bch: {
      chains: ['bch:bitcoincash'],
      methods: [
        'bch_getAddresses',
        'bch_signTransaction',
        'bch_signMessage',
        'bch_cancelPendingRequests',
      ],
      events: ['addressesChanged'],
      accounts: [`bch:${signingIntent().fromAddress}`],
    },
  },
});

/** Create an isolated SDK-shaped relay with real first-account signed transaction bytes. */
const fixture = () => {
  const session = approved();
  const handlers = new Map<string, (event: { topic: string }) => void>();
  const signedTransaction = signIntent(signingIntent());
  const client = {
    connect: vi.fn(async () => ({
      uri: 'wc:fixture@2?relay-protocol=irn',
      approval: async () => session,
    })),
    session: { get: vi.fn(() => session) },
    request: vi.fn(
      async (request: { request: { method: string } }): Promise<unknown> =>
        request.request.method === 'bch_getAddresses'
          ? [signingIntent().fromAddress]
          : {
              signedTransaction,
              signedTransactionHash: hashTransaction(hexToBin(signedTransaction)),
            },
    ),
    disconnect: vi.fn(async () => undefined),
    on: vi.fn((event: string, callback: (event: { topic: string }) => void) => {
      handlers.set(event, callback);
    }),
    off: vi.fn(),
  };
  const showUri = vi.fn();
  const select = vi.fn(async (addresses: readonly string[]) => addresses[0]);
  // Only the test double is adapted; production construction accepts actual SDK types.
  const adapter = new CashonizeSession(
    client as unknown as ConstructorParameters<typeof CashonizeSession>[0],
    100,
    showUri,
    select,
  );
  return { client, session, handlers, showUri, select, adapter };
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  initialize.mockReset();
});

const { initialize } = vi.hoisted(() => ({ initialize: vi.fn() }));
vi.mock('@walletconnect/sign-client', () => ({ default: { init: initialize } }));
/** Supply public test app metadata and explicit bounded SDK initialization settings. */
const options = () => ({
  projectId: 'ab'.repeat(16),
  metadata: {
    name: 'Rosen Bridge',
    description: 'Bridge native BCH',
    url: 'https://rosen.tech',
    icons: [],
  },
  timeoutMs: 100,
  showUri: vi.fn(),
  selectAccount: async (addresses: readonly string[]) => addresses[0],
});
/** Model SDK listener registration and late transport cleanup without a real relay. */
const client = () => ({
  on: vi.fn(),
  off: vi.fn(),
  core: { relayer: { transportClose: vi.fn(async () => undefined) } },
});

describe('validateCashonizeSession', () => {
  /**
   * @target Only bounded mainnet permissions and native ordinary accounts are accepted.
   * @dependencies Real source-address fixture and independent malformed authorization fields.
   * @scenario Change namespace, chain, methods, events, account, expiry or topic.
   * @expected Reject each single invalid session field before any wallet request.
   */
  it.each([
    'namespace',
    'chain',
    'method',
    'missingMethod',
    'event',
    'account',
    'expired',
    'topic',
  ])('rejects unauthorized %s', (mutation) => {
    const value = approved();
    if (mutation === 'namespace') Object.assign(value.namespaces, { eip155: value.namespaces.bch });
    if (mutation === 'chain') value.namespaces.bch.chains = ['bch:bchtest'];
    if (mutation === 'method') value.namespaces.bch.methods.push('bch_broadcastTransaction');
    if (mutation === 'missingMethod') value.namespaces.bch.methods = ['bch_signTransaction'];
    if (mutation === 'event') value.namespaces.bch.events = ['chainChanged'];
    if (mutation === 'account') value.namespaces.bch.accounts = ['bch:bchtest:qqinvalid'];
    if (mutation === 'expired') value.expiry = Math.floor(Date.now() / 1000);
    if (mutation === 'topic') value.topic = 'ab';
    expect(() => validateCashonizeSession(value)).toThrow();
  });

  /**
   * @target CashToken-aware address variants never enter ordinary native authorization.
   * @dependencies Real libauth CashAddr encoding of the ordinary source hash.
   * @scenario Encode the same valid P2PKH script using tokenSupport true.
   * @expected Reject token-aware authorization despite a valid mainnet checksum.
   */
  it('rejects token-aware P2PKH CashAddr in the session', () => {
    const token = lockingBytecodeToCashAddress({
      bytecode: hexToBin(parentOutput(1).scriptPubKey),
      prefix: 'bitcoincash',
      tokenSupport: true,
    });
    if (typeof token === 'string') throw new Error(token);
    const session = approved();
    session.namespaces.bch.accounts = [`bch:${token.address}`];
    expect(() => validateCashonizeSession(session)).toThrow('ordinary mainnet');
  });
});

describe('CashonizeSession', () => {
  describe('connect', () => {
    /**
     * @target HD sessions permit explicit selection without requiring one account.
     * @dependencies Two approved mainnet addresses and wallet-returned approved subset.
     * @scenario Approve two HD addresses and confirm the first, which Cashonize actually signs.
     * @expected Only the signable first account is offered; the deposit still signs successfully.
     */
    it('requires explicit selection among approved HD accounts', async () => {
      const { adapter, session, select } = fixture();
      const second = parameters().lockAddress;
      session.namespaces.bch.accounts.push(`bch:${second}`);
      await adapter.connect();
      expect(select).toHaveBeenCalledWith([parameters().fromAddress]);
      expect(adapter.getAddress()).toEqual(parameters().fromAddress);
      expect((await adapter.sign(parameters())).txId).toMatch(/^[0-9a-f]{64}$/);
    });

    /**
     * @target Selected account authorization cannot be invented by the UI callback.
     * @dependencies Approved session and explicit account-selection callback.
     * @scenario Choose an ordinary account absent from the wallet's approved list.
     * @expected Reject connection, clear authorization and disconnect the approval.
     */
    it('rejects an unapproved explicit account selection', async () => {
      const { adapter, select, client } = fixture();
      select.mockResolvedValue(parameters().lockAddress);
      await expect(adapter.connect()).rejects.toThrow('not signable');
      expect(() => adapter.getAddress()).toThrow('disconnected');
      await Promise.resolve();
      expect(client.disconnect).toHaveBeenCalledOnce();
    });

    /**
     * @target Pinned Cashonize signs only the first approved account, even with HD namespaces.
     * @dependencies Primary-shaped approved account ordering and signability selection.
     * @scenario UI selects the second approved ordinary mainnet account.
     * @expected Reject before any sign request instead of claiming second-account interoperability.
     */
    it('rejects the approved but unsupported second HD signing account', async () => {
      const { adapter, session, select, client } = fixture();
      const second = parameters().lockAddress;
      session.namespaces.bch.accounts.push(`bch:${second}`);
      select.mockResolvedValue(second);
      await expect(adapter.connect()).rejects.toThrow('not signable');
      expect(client.request).not.toHaveBeenCalled();
    });

    /**
     * @target Cancelled/disposed pending proposals are cleaned up without showing stale prompts.
     * @dependencies Delayed fake SDK proposal and approval promises.
     * @scenario Abort or dispose before connect resolves, then return a valid proposal/session.
     * @expected Reject locally, show no URI/account prompt and disconnect any late approval.
     */
    it.each(['abort', 'dispose'])('cleans up a late proposal after %s', async (mutation) => {
      const { adapter, client, session, showUri, select } = fixture();
      const approval = vi.fn(async () => session);
      let resolve!: (value: { uri: string; approval: typeof approval }) => void;
      client.connect.mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
      const abort = new AbortController();
      const pending = adapter.connect(abort.signal);
      const failure = expect(pending).rejects.toThrow('cancelled');
      if (mutation === 'abort') abort.abort();
      else adapter.dispose();
      resolve({ uri: 'wc:fixture@2', approval });
      await failure;
      await vi.waitFor(() => expect(client.disconnect).toHaveBeenCalledOnce());
      expect(approval).toHaveBeenCalledOnce();
      expect(showUri).not.toHaveBeenCalled();
      expect(select).not.toHaveBeenCalled();
    });

    /**
     * @target Timeout/cancellation must discard a late approval and release local availability.
     * @dependencies Fake timers and manually delayed session approval.
     * @scenario Approval arrives after the local operation deadline.
     * @expected Reject connect, remotely disconnect the late session and retain no address.
     */
    it('disconnects late approval after a connection timeout', async () => {
      vi.useFakeTimers();
      const { adapter, client, session } = fixture();
      let resolve!: (value: typeof session) => void;
      client.connect.mockResolvedValueOnce({
        uri: 'wc:fixture@2',
        approval: () =>
          new Promise((done) => {
            resolve = done;
          }),
      });
      const pending = adapter.connect();
      const failure = expect(pending).rejects.toThrow('timed out');
      await vi.advanceTimersByTimeAsync(101);
      await failure;
      resolve(session);
      await Promise.resolve();
      await Promise.resolve();
      expect(client.disconnect).toHaveBeenCalledWith({
        topic: session.topic,
        reason: { code: 6000, message: 'User disconnected.' },
      });
      expect(() => adapter.getAddress()).toThrow('disconnected');
    });
  });

  describe('sign', () => {
    /**
     * @target Raw relay failures never leak SDK details into public wallet errors.
     * @dependencies Connected fake client with an arbitrary SDK error marker.
     * @scenario The next relay request rejects with an arbitrary detail.
     * @expected Return a fixed public error without echoing that detail.
     */
    it('sanitizes relay request failures', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      client.request.mockRejectedValueOnce(new Error('fixture-sdk-detail-do-not-display'));
      await expect(adapter.sign(parameters())).rejects.toThrow(/^BCH wallet request failed$/);
    });
    /**
     * @target A single signing deadline covers all relay phases rather than resetting per await.
     * @dependencies Real signed fixture and controlled clock without timer dispatch.
     * @scenario Address and signing responses each take 60ms within a total 100ms budget.
     * @expected Reject the valid response at 120ms and request cancellation.
     */
    it('rejects combined phases exceeding the shared signing deadline', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      let now = Date.now();
      vi.spyOn(Date, 'now').mockImplementation(() => now);
      const original = client.request.getMockImplementation();
      client.request.mockImplementation(async (request) => {
        if (['bch_getAddresses', 'bch_signTransaction'].includes(request.request.method)) now += 60;
        return original?.(request);
      });
      await expect(adapter.sign(parameters())).rejects.toThrow('timed out');
      expect(client.request.mock.calls.at(-1)?.[0].request.method).toEqual(
        'bch_cancelPendingRequests',
      );
    });

    /**
     * @target Actual SignClient-shaped connection and signing stay on the authorized chain/account.
     * @dependencies Fake relay methods, real builder and real Schnorr verification.
     * @scenario Connect with the real approved four-method shape and sign a native deposit.
     * @expected Necessary three-method proposal, explicit account selection and broadcast false.
     */
    it('connects, selects an account and returns validated signed bytes', async () => {
      const { adapter, client, select, showUri } = fixture();
      await adapter.connect();
      expect(select).toHaveBeenCalledWith([parameters().fromAddress]);
      expect(showUri).toHaveBeenCalledOnce();
      expect(client.connect).toHaveBeenCalledWith({
        requiredNamespaces: {
          bch: {
            chains: ['bch:bitcoincash'],
            methods: ['bch_getAddresses', 'bch_signTransaction', 'bch_cancelPendingRequests'],
            events: ['addressesChanged'],
          },
        },
      });
      const result = await adapter.sign(parameters());
      expect(result.txId).toMatch(/^[0-9a-f]{64}$/);
      expect(client.request.mock.calls[1][0]).toMatchObject({
        chainId: 'bch:bitcoincash',
        request: { method: 'bch_signTransaction', params: { broadcast: false } },
      });
      await adapter.disconnect();
      expect(() => adapter.getAddress()).toThrow('disconnected');
    });

    /**
     * @target Absolute operation deadlines reject overdue microtasks before timers dispatch.
     * @dependencies Controlled clock with immediately resolving fake relay responses.
     * @scenario Advance the clock past the shared deadline during address or signature response.
     * @expected Reject late results; address-phase expiry never sends signTransaction.
     */
    it.each(['address', 'signature'])(
      'rejects overdue %s response before timer dispatch',
      async (phase) => {
        const { adapter, client } = fixture();
        await adapter.connect();
        let now = Date.now();
        vi.spyOn(Date, 'now').mockImplementation(() => now);
        const original = client.request.getMockImplementation();
        client.request.mockImplementation(async (request) => {
          if (
            (phase === 'address' && request.request.method === 'bch_getAddresses') ||
            (phase === 'signature' && request.request.method === 'bch_signTransaction')
          )
            now += 1000;
          return original?.(request);
        });
        await expect(adapter.sign(parameters())).rejects.toThrow('timed out');
        if (phase === 'address')
          expect(
            client.request.mock.calls.some(
              (call) => call[0].request.method === 'bch_signTransaction',
            ),
          ).toEqual(false);
      },
    );

    /**
     * @target Session mutation while a signature is pending invalidates the returned result.
     * @dependencies Connected fake SDK and manually delayed signing response.
     * @scenario Delete the active session before a genuine signed response arrives.
     * @expected Reject the otherwise valid response and request wallet cancellation.
     */
    it('rejects valid signed bytes returned after session deletion', async () => {
      const { adapter, client, handlers, session } = fixture();
      await adapter.connect();
      let resolve!: (value: unknown) => void;
      let ready!: () => void;
      const requested = new Promise<void>((done) => {
        ready = done;
      });
      client.request.mockImplementationOnce(async () => [parameters().fromAddress]);
      client.request.mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
            ready();
          }),
      );
      const pending = adapter.sign(parameters());
      const failure = expect(pending).rejects.toThrow('disconnected');
      await requested;
      handlers.get('session_delete')?.({ topic: session.topic });
      const signedTransaction = signIntent(signingIntent());
      resolve({
        signedTransaction,
        signedTransactionHash: hashTransaction(hexToBin(signedTransaction)),
      });
      await failure;
      expect(client.request.mock.calls.at(-1)?.[0].request.method).toEqual(
        'bch_cancelPendingRequests',
      );
    });

    /**
     * @target An account mismatch is rejected before the sign request.
     * @dependencies Connected session and fake wallet getAddresses response.
     * @scenario Wallet returns an address absent from the approved selected account.
     * @expected No signTransaction call; cancellation method is used after failure.
     */
    it('rejects wallet address response mismatch before asking for a signature', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      client.request.mockResolvedValueOnce([parameters().lockAddress]);
      await expect(adapter.sign(parameters())).rejects.toThrow('address response mismatch');
      expect(client.request.mock.calls.map((call) => call[0].request.method)).toEqual([
        'bch_getAddresses',
        'bch_cancelPendingRequests',
      ]);
    });

    /**
     * @target User cancellation invalidates pending signature results and requests wallet cancellation.
     * @dependencies Connected fake SDK and abort controller.
     * @scenario Abort a pending sign request after getAddresses succeeds.
     * @expected Reject locally and send only the authorized cancel method.
     */
    it('cancels a pending signature without accepting late bytes', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      client.request.mockImplementationOnce(async () => [parameters().fromAddress]);
      let ready!: () => void;
      const requested = new Promise<void>((done) => {
        ready = done;
      });
      client.request.mockImplementationOnce(
        () =>
          new Promise(() => {
            ready();
          }),
      );
      const abort = new AbortController();
      const pending = adapter.sign(parameters(), abort.signal);
      const failure = expect(pending).rejects.toThrow('cancelled');
      await requested;
      abort.abort();
      await failure;
      expect(client.request.mock.calls.at(-1)?.[0].request.method).toEqual(
        'bch_cancelPendingRequests',
      );
    });
  });

  describe('getAddress', () => {
    /**
     * @target Missing SDK storage records become fixed disconnected errors.
     * @dependencies Connected fake SDK and an isolated record lookup failure.
     * @scenario Session store throws an arbitrary SDK detail.
     * @expected Report disconnection without exposing storage diagnostics.
     */
    it('sanitizes session lookup failures', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      client.session.get.mockImplementationOnce(() => {
        throw new Error('fixture-store-detail-do-not-display');
      });
      expect(() => adapter.getAddress()).toThrow(/^BCH wallet is disconnected$/);
    });
    /**
     * @target Stored permissions are checked anew without relying only on SDK events.
     * @dependencies Connected adapter and mutable fake SDK session record.
     * @scenario Expire the SDK record after connection without delivering an event.
     * @expected Reject cached address retrieval.
     */
    it('rejects an expired stored session even without an expiry event', async () => {
      const { adapter, session } = fixture();
      await adapter.connect();
      session.expiry = Math.floor(Date.now() / 1000);
      expect(() => adapter.getAddress()).toThrow('expired');
    });

    /**
     * @target Session changes invalidate account authorization during use.
     * @dependencies Fake SDK event delivery and connected authorization.
     * @scenario Deliver update, deletion, expiry or account-change events for the active topic.
     * @expected Reject subsequent address retrieval without using cached authorization.
     */
    it.each(['session_update', 'session_delete', 'session_expire', 'session_event'])(
      'invalidates authorization on %s',
      async (event) => {
        const { adapter, handlers, session } = fixture();
        await adapter.connect();
        handlers.get(event)?.({ topic: session.topic });
        expect(() => adapter.getAddress()).toThrow('disconnected');
      },
    );
  });

  describe('disconnect', () => {
    /**
     * @target Failed relay disconnect cannot preserve local spending authorization.
     * @dependencies Connected fake SDK and isolated disconnect rejection.
     * @scenario SDK disconnect rejects after the local account has been cleared.
     * @expected Propagate failure while address retrieval remains disconnected.
     */
    it('clears local authorization even when relay disconnect fails', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      client.disconnect.mockRejectedValueOnce(new Error('Public fixture disconnect rejection'));
      await expect(adapter.disconnect()).rejects.toThrow(/^BCH wallet request failed$/);
      expect(() => adapter.getAddress()).toThrow('disconnected');
    });
  });

  describe('dispose', () => {
    /**
     * @target Disposed session listeners and future connections are unavailable.
     * @dependencies Connected fake client and listener removal tracking.
     * @scenario Dispose a connected adapter and attempt a new connection.
     * @expected Four listeners removed and no authorization retained.
     */
    it('removes listeners and rejects operations after disposal', async () => {
      const { adapter, client } = fixture();
      await adapter.connect();
      adapter.dispose();
      expect(client.off).toHaveBeenCalledTimes(4);
      await expect(adapter.connect()).rejects.toThrow('unavailable');
      expect(() => adapter.getAddress()).toThrow('disconnected');
    });
  });
});

describe('createCashonizeSession', () => {
  /**
   * @target SDK startup failures never expose arbitrary initialization diagnostics.
   * @dependencies Isolated rejected SDK initializer without relay access.
   * @scenario SDK initialization rejects with an arbitrary detail marker.
   * @expected Reject with the fixed public initialization failure.
   */
  it('sanitizes SDK initialization failures', async () => {
    initialize.mockRejectedValueOnce(new Error('fixture-init-detail-do-not-display'));
    await expect(createCashonizeSession(options())).rejects.toThrow(
      /^BCH wallet initialization failed$/,
    );
  });
  /**
   * @target Factory checks the absolute deadline before accepting an SDK client.
   * @dependencies Clock jump inside an immediately resolving SDK initialization.
   * @scenario SDK returns after elapsed deadline before a timer callback can dispatch.
   * @expected Reject startup and close the otherwise valid late transport.
   */
  it('rejects overdue SDK completion before timer dispatch', async () => {
    let now = Date.now();
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const sdk = client();
    initialize.mockImplementation(async () => {
      now += 1000;
      return sdk;
    });
    await expect(createCashonizeSession(options())).rejects.toThrow('timed out');
    await Promise.resolve();
    expect(sdk.core.relayer.transportClose).toHaveBeenCalledOnce();
  });

  /**
   * @target Production construction initializes the actual SDK interface with explicit app configuration.
   * @dependencies Mocked SDK initialization only; no relay connection.
   * @scenario Supply bounded project ID, app metadata and lifecycle callbacks.
   * @expected Pass exact SDK options and return a disconnected session with registered listeners.
   */
  it('initializes the pinned SDK interface without an implicit session', async () => {
    const sdk = client();
    initialize.mockResolvedValue(sdk);
    const config = options();
    const result = await createCashonizeSession(config);
    expect(initialize).toHaveBeenCalledWith({
      projectId: config.projectId,
      metadata: config.metadata,
    });
    expect(sdk.on).toHaveBeenCalledTimes(4);
    expect(() => result.getAddress()).toThrow('disconnected');
  });

  /**
   * @target Invalid operator connection settings never initialize network resources.
   * @dependencies SDK mock and independently invalid configuration fields.
   * @scenario Supply malformed project ID, unbounded deadline or invalid metadata URL.
   * @expected Reject each field before SDK initialization.
   */
  it.each(['project', 'timeout', 'metadata'])(
    'rejects invalid %s before initializing',
    async (mutation) => {
      const config = options();
      if (mutation === 'project') config.projectId = 'invalid';
      if (mutation === 'timeout') config.timeoutMs = 30001;
      if (mutation === 'metadata') config.metadata.url = 'http://rosen.tech';
      await expect(createCashonizeSession(config)).rejects.toThrow();
      expect(initialize).not.toHaveBeenCalled();
    },
  );

  /**
   * @target SDK startup cannot expose a session after its local deadline.
   * @dependencies Fake timers and manually delayed SDK initialization.
   * @scenario Initialize after the local deadline has rejected the operation.
   * @expected Reject the factory and close the late client's relay transport.
   */
  it('closes a late SDK transport after initialization timeout', async () => {
    vi.useFakeTimers();
    const sdk = client();
    let resolve!: (value: typeof sdk) => void;
    initialize.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = createCashonizeSession(options());
    const failure = expect(pending).rejects.toThrow('initialization timed out');
    await vi.waitFor(() => expect(initialize).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(101);
    await failure;
    resolve(sdk);
    await Promise.resolve();
    await Promise.resolve();
    expect(sdk.core.relayer.transportClose).toHaveBeenCalledOnce();
  });
});
