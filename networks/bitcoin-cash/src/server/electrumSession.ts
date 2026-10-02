import { createHash } from 'node:crypto';
import { connect, type TLSSocket } from 'node:tls';

/** Server-configured TLS endpoint and bounded operation deadline. */
export interface BitcoinCashElectrumOptions {
  hostname: string;
  port: number;
  timeoutMs?: number;
}

/** Limits apply before a remote frame is allocated or parsed. */
export const ELECTRUM_LIMITS = {
  frameBytes: 2_000_512,
  operationBytes: 4_000_000,
  controlBytes: 4096,
  listBytes: 262_144,
  connectMs: 5000,
  requestMs: 10_000,
  operationMs: 30_000,
} as const;

type ReadMethod =
  | 'server.version'
  | 'blockchain.block.header'
  | 'blockchain.headers.get_tip'
  | 'blockchain.scripthash.listunspent'
  | 'blockchain.transaction.get';

const methods = new Set<ReadMethod>([
  'server.version',
  'blockchain.block.header',
  'blockchain.headers.get_tip',
  'blockchain.scripthash.listunspent',
  'blockchain.transaction.get',
]);

interface PendingRequest {
  id: number;
  maxBytes: number;
  deadline: number;
  timer: ReturnType<typeof setTimeout>;
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
}

/** One owned TLS session; submission requires a separate explicit capability. */
export class BitcoinCashElectrumSession {
  private readonly socket: TLSSocket;
  private readonly ready: Promise<void>;
  private resolveReady: (() => void) | undefined;
  private rejectReady: ((error: Error) => void) | undefined;
  private readonly operationTimer: ReturnType<typeof setTimeout>;
  private readonly connectTimer: ReturnType<typeof setTimeout>;
  private readonly deadline: number;
  private readonly connectDeadline: number;
  private pending: PendingRequest | undefined;
  private buffer = Buffer.alloc(0);
  private bufferedBytes = 0;
  private receivedBytes = 0;
  private requestId = 0;
  private connected = false;
  private closed = false;
  private broadcastUsed = false;

  /** Owns one verified socket and starts finite connection/operation timers. */
  private constructor(
    options: BitcoinCashElectrumOptions,
    private readonly submissionMode: boolean,
    private readonly signal?: AbortSignal,
    absoluteDeadline?: number,
  ) {
    const started = Date.now();
    const timeout = options.timeoutMs ?? ELECTRUM_LIMITS.operationMs;
    this.deadline = Math.min(started + timeout, absoluteDeadline ?? Infinity);
    this.connectDeadline = Math.min(this.deadline, started + ELECTRUM_LIMITS.connectMs);
    if (started >= this.deadline) throw new Error('BCH Electrum operation timed out');
    this.ready = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.socket = connect({
      host: options.hostname,
      port: options.port,
      servername: options.hostname,
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
    });
    this.socket.on('secureConnect', this.onSecureConnect);
    this.socket.on('data', this.onData);
    this.socket.on('error', this.onError);
    this.socket.on('close', this.onClose);
    this.operationTimer = setTimeout(
      () => this.fail('BCH Electrum operation timed out'),
      Math.max(0, this.deadline - Date.now()),
    );
    this.connectTimer = setTimeout(
      () => this.fail('BCH Electrum TLS connection timed out'),
      Math.max(0, this.connectDeadline - Date.now()),
    );
    this.signal?.addEventListener('abort', this.onAbort, { once: true });
    // Cancellation may occur inside socket acquisition before listener attachment.
    if (this.signal?.aborted) this.onAbort();
    else if (Date.now() >= this.deadline) this.fail('BCH Electrum operation timed out');
  }

  /**
   * Opens a certificate-verified TLS session with finite deadlines.
   * @param options Endpoint supplied only by server configuration.
   * @param signal Optional caller cancellation, separate from endpoint configuration.
   * @param absoluteDeadline Optional trusted enclosing deadline in Unix milliseconds.
   * @returns A connected session that the caller must close in a finally block.
   */
  static open = async (
    options: BitcoinCashElectrumOptions,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<BitcoinCashElectrumSession> =>
    BitcoinCashElectrumSession.openMode(options, false, signal, absoluteDeadline);

  /** Internal submission capability; never exported from the public server barrel. */
  static openForSubmission = async (
    options: BitcoinCashElectrumOptions,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<BitcoinCashElectrumSession> =>
    BitcoinCashElectrumSession.openMode(options, true, signal, absoluteDeadline);

  /** Validates configuration before acquiring one socket in the requested mode. */
  private static openMode = async (
    options: BitcoinCashElectrumOptions,
    submissionMode: boolean,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<BitcoinCashElectrumSession> => {
    const timeout = options.timeoutMs ?? ELECTRUM_LIMITS.operationMs;
    if (
      typeof options.hostname !== 'string' ||
      !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/.test(options.hostname) ||
      !Number.isSafeInteger(options.port) ||
      options.port < 1 ||
      options.port > 65535 ||
      !Number.isSafeInteger(timeout) ||
      timeout < 1 ||
      timeout > ELECTRUM_LIMITS.operationMs ||
      (signal !== undefined && !(signal instanceof AbortSignal)) ||
      (absoluteDeadline !== undefined &&
        (!Number.isSafeInteger(absoluteDeadline) || absoluteDeadline < 1))
    ) {
      throw new Error('Invalid BCH Electrum server configuration');
    }
    if (signal?.aborted) throw new Error('BCH Electrum operation cancelled');
    if (absoluteDeadline !== undefined && Date.now() >= absoluteDeadline)
      throw new Error('BCH Electrum operation timed out');
    let session: BitcoinCashElectrumSession;
    try {
      session = new BitcoinCashElectrumSession(options, submissionMode, signal, absoluteDeadline);
    } catch {
      if (absoluteDeadline !== undefined && Date.now() >= absoluteDeadline)
        throw new Error('BCH Electrum operation timed out');
      throw new Error('BCH Electrum TLS connection failed');
    }
    await session.ready;
    session.checkDeadline();
    return session;
  };

  /** Accepts a ready connection only after TLS certificate authorization. */
  private onSecureConnect = (): void => {
    if (this.signal?.aborted) {
      this.onAbort();
      return;
    }
    if (Date.now() >= this.connectDeadline) {
      this.fail('BCH Electrum TLS connection timed out');
      return;
    }
    if (!this.socket.authorized) {
      this.fail('BCH Electrum TLS certificate rejected');
      return;
    }
    this.connected = true;
    clearTimeout(this.connectTimer);
    this.resolveReady?.();
    this.resolveReady = undefined;
    this.rejectReady = undefined;
  };

  /** Replaces transport error details with a fixed public-safe failure. */
  private onError = (): void => this.fail('BCH Electrum TLS connection failed');
  /** Rejects pending work when the remote transport closes unexpectedly. */
  private onClose = (): void => this.fail('BCH Electrum TLS connection closed');

  /** Rejects outstanding work on caller cancellation without exposing its reason. */
  private onAbort = (): void => this.fail('BCH Electrum operation cancelled');

  /** Bounds bytes before framing, parsing and matching the sole pending response. */
  private onData = (chunk: Buffer): void => {
    const pending = this.pending;
    if (!pending || !Buffer.isBuffer(chunk) || chunk.length === 0) {
      this.fail('Unexpected BCH Electrum response');
      return;
    }
    if (this.rejectExpiredFrame(pending)) return;
    this.receivedBytes += chunk.length;
    if (
      this.receivedBytes > ELECTRUM_LIMITS.operationBytes ||
      this.bufferedBytes + chunk.length > pending.maxBytes + 1
    ) {
      this.fail('BCH Electrum response byte limit exceeded');
      return;
    }
    // Each new byte is copied and scanned once, regardless of fragmentation.
    const newline = chunk.indexOf(10);
    if (newline !== -1 && newline !== chunk.length - 1) {
      this.fail('Unexpected BCH Electrum response framing');
      return;
    }
    chunk.copy(this.buffer, this.bufferedBytes);
    this.bufferedBytes += chunk.length;
    if (newline === -1) {
      if (this.bufferedBytes > pending.maxBytes)
        this.fail('BCH Electrum response byte limit exceeded');
      return;
    }
    let response: unknown;
    try {
      response = JSON.parse(
        new TextDecoder('utf-8', { fatal: true }).decode(
          this.buffer.subarray(0, this.bufferedBytes - 1),
        ),
      );
    } catch {
      this.fail('Malformed BCH Electrum JSON response');
      return;
    }
    if (this.rejectExpiredFrame(pending)) return;
    if (
      !response ||
      typeof response !== 'object' ||
      Array.isArray(response) ||
      !('jsonrpc' in response) ||
      response.jsonrpc !== '2.0' ||
      !('id' in response) ||
      response.id !== pending.id ||
      Object.hasOwn(response, 'result') === Object.hasOwn(response, 'error')
    ) {
      this.fail('Malformed BCH Electrum response identity');
      return;
    }
    if ('error' in response) {
      this.fail('BCH Electrum request rejected');
      return;
    }
    this.buffer = Buffer.alloc(0);
    this.bufferedBytes = 0;
    this.pending = undefined;
    clearTimeout(pending.timer);
    pending.resolve('result' in response ? response.result : undefined);
  };

  /** Enforces absolute read/operation deadlines even while a burst delays timers. */
  private rejectExpiredFrame = (pending: PendingRequest): boolean => {
    if (this.signal?.aborted) {
      this.onAbort();
      return true;
    }
    if (Date.now() < pending.deadline) return false;
    this.fail(
      pending.deadline === this.deadline
        ? 'BCH Electrum operation timed out'
        : 'BCH Electrum request timed out',
    );
    return true;
  };

  /**
   * Sends one allowlisted read, requiring a matching bounded JSON-RPC response.
   * @param method Internal read method; there is no generic browser RPC route.
   * @param params Parameters validated by the provider.
   * @param maxBytes Maximum reply bytes before its newline.
   * @returns The untrusted result, for the provider to authenticate.
   */
  request = async (
    method: ReadMethod,
    params: readonly unknown[],
    maxBytes: number = ELECTRUM_LIMITS.controlBytes,
  ): Promise<unknown> => {
    if (!methods.has(method)) throw new Error('Invalid BCH Electrum session request');
    return this.sendRequest(method, params, maxBytes);
  };

  /** Sends a bounded internal request after its read or submission capability check. */
  private sendRequest = async (
    method: ReadMethod | 'blockchain.transaction.broadcast',
    params: readonly unknown[],
    maxBytes: number,
  ): Promise<unknown> => {
    this.checkDeadline();
    if (
      this.closed ||
      !this.connected ||
      this.pending ||
      !Number.isSafeInteger(maxBytes) ||
      maxBytes < 1 ||
      maxBytes > ELECTRUM_LIMITS.frameBytes
    ) {
      throw new Error('Invalid BCH Electrum session request');
    }
    const id = ++this.requestId;
    this.buffer = Buffer.alloc(maxBytes + 1);
    this.bufferedBytes = 0;
    return new Promise<unknown>((resolve, reject) => {
      this.pending = {
        id,
        maxBytes,
        deadline: Math.min(this.deadline, Date.now() + ELECTRUM_LIMITS.requestMs),
        resolve,
        reject,
        timer: setTimeout(
          () => this.fail('BCH Electrum request timed out'),
          ELECTRUM_LIMITS.requestMs,
        ),
      };
      try {
        const frame = `${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`;
        this.checkDeadline();
        this.socket.write(frame);
      } catch {
        this.fail('BCH Electrum TLS write failed');
      }
    });
  };

  /**
   * Emits one validated signed transaction and requires its exact local transaction ID.
   * @param signedHex Bounded canonical bytes authenticated by the dedicated submitter.
   * @param expectedTxId Local double-SHA256 identity of those exact bytes.
   * @returns The matching remote transaction ID.
   * @remarks An ambiguous result consumes this capability; it is never retried.
   */
  broadcastValidated = async (signedHex: string, expectedTxId: string): Promise<string> => {
    this.checkDeadline();
    if (
      !this.submissionMode ||
      this.broadcastUsed ||
      typeof signedHex !== 'string' ||
      signedHex.length === 0 ||
      signedHex.length > 200_000 ||
      !/^(?:[0-9a-f]{2})+$/.test(signedHex) ||
      typeof expectedTxId !== 'string' ||
      !/^[0-9a-f]{64}$/.test(expectedTxId)
    )
      throw new Error('Invalid BCH Electrum submission capability');
    const first = createHash('sha256').update(Buffer.from(signedHex, 'hex')).digest();
    const localHash = createHash('sha256').update(first).digest().reverse().toString('hex');
    if (localHash !== expectedTxId) throw new Error('BCH submission byte identity mismatch');
    this.checkDeadline();
    this.broadcastUsed = true;
    try {
      const result = await this.sendRequest(
        'blockchain.transaction.broadcast',
        [signedHex],
        ELECTRUM_LIMITS.controlBytes,
      );
      if (result !== expectedTxId) throw new Error('BCH submission result is ambiguous');
      this.checkDeadline();
      return expectedTxId;
    } catch {
      this.close();
      throw new Error('BCH submission outcome is unknown or rejected');
    }
  };

  /** Rejects overdue operations even if synchronous parsing delayed a timer. */
  checkDeadline = (): void => {
    if (this.signal?.aborted) {
      this.onAbort();
      throw new Error('BCH Electrum operation cancelled');
    }
    if (this.closed || Date.now() >= this.deadline) {
      this.fail('BCH Electrum operation timed out');
      throw new Error('BCH Electrum session expired');
    }
  };

  /** Rejects outstanding work with a fixed error and releases the session. */
  private fail = (message: string): void => {
    if (this.closed) return;
    const error = new Error(message);
    this.rejectReady?.(error);
    this.rejectReady = undefined;
    this.resolveReady = undefined;
    this.pending?.reject(error);
    this.close();
  };

  /** Releases the socket, buffers, listeners and every outstanding timer. */
  close = (): void => {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.operationTimer);
    clearTimeout(this.connectTimer);
    this.signal?.removeEventListener('abort', this.onAbort);
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(new Error('BCH Electrum session closed'));
      this.pending = undefined;
    }
    this.buffer = Buffer.alloc(0);
    this.bufferedBytes = 0;
    this.socket.off('secureConnect', this.onSecureConnect);
    this.socket.off('data', this.onData);
    this.socket.off('error', this.onError);
    this.socket.off('close', this.onClose);
    // A late transport error after destruction must not become unhandled.
    this.socket.on('error', () => undefined);
    this.socket.destroy();
  };
}
