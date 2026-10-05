import type { BitcoinCashUnsignedLock } from '../generateUnsignedTx';
import type { BitcoinCashLockMetadata } from '../metadata';
import { BitcoinCashSubmissionRequestError, readBitcoinCashSubmissionBody } from './submissionBody';

/** Completed trusted server port; the HTTP envelope supplies only destination intent, never fee authority. */
export interface BitcoinCashSubmissionPort {
  submitTransaction(
    signedHex: string,
    intent: BitcoinCashUnsignedLock,
    destination: Pick<BitcoinCashLockMetadata, 'toChain' | 'toAddress'>,
    signal?: AbortSignal,
    absoluteDeadline?: number,
  ): Promise<string>;
}

/** Return small fixed responses without caching signed request or provider diagnostics. */
const result = (body: { txId: string } | { error: string }, status: number) =>
  Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });

/** Build a same-origin dedicated POST handler around the bounded decoder and trusted submission port. */
export const createBitcoinCashSubmissionHandler = (options: {
  timeoutMs: number;
  getRuntime(): BitcoinCashSubmissionPort | undefined;
}) => {
  if (
    !Number.isSafeInteger(options.timeoutMs) ||
    options.timeoutMs < 1 ||
    options.timeoutMs > 30000
  )
    throw new Error('Invalid BCH submission deadline');
  const timeoutMs = options.timeoutMs;
  const getRuntime = options.getRuntime;

  /** Reject foreign browser origins and cancelled bodies before invoking server-owned quote or broadcast. */
  return async (request: Request): Promise<Response> => {
    const deadline = Date.now() + timeoutMs;
    if (request.headers.get('origin') !== new URL(request.url).origin)
      return result({ error: 'BCH submission origin rejected' }, 403);
    let runtime: BitcoinCashSubmissionPort | undefined;
    try {
      runtime = getRuntime();
    } catch {
      return result({ error: 'BCH bridge unavailable' }, 503);
    }
    if (!runtime) return result({ error: 'BCH bridge unavailable' }, 503);
    const expired = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled: (() => void) | undefined;
    let submissionStarted = false;
    /** Bound the whole endpoint, including synchronous decode and asynchronous trusted quote work. */
    const active = () => {
      if (Date.now() >= deadline) {
        expired.abort();
        throw new BitcoinCashSubmissionRequestError(408);
      }
      if (request.signal.aborted) throw new BitcoinCashSubmissionRequestError(400);
    };
    try {
      active();
      const decoded = await readBitcoinCashSubmissionBody(request, deadline - Date.now());
      active();
      const signal = AbortSignal.any([request.signal, expired.signal]);
      const cancellation = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new BitcoinCashSubmissionRequestError(408));
          expired.abort();
        }, deadline - Date.now());
        cancelled = () => reject(new BitcoinCashSubmissionRequestError(400));
        request.signal.addEventListener('abort', cancelled, { once: true });
      });
      active();
      submissionStarted = true;
      const txId = await Promise.race([
        runtime.submitTransaction(
          decoded.signedTransactionHex,
          decoded.intent,
          decoded.destination,
          signal,
          deadline,
        ),
        cancellation,
      ]);
      active();
      if (!/^[0-9a-f]{64}$/.test(txId)) throw new Error('Invalid BCH submission result');
      return result({ txId }, 200);
    } catch (error) {
      if (Date.now() >= deadline) {
        expired.abort();
        return result(
          {
            error: submissionStarted
              ? 'BCH submission status unavailable'
              : 'BCH submission request rejected',
          },
          408,
        );
      }
      if (error instanceof BitcoinCashSubmissionRequestError)
        return result(
          {
            error: submissionStarted
              ? 'BCH submission status unavailable'
              : 'BCH submission request rejected',
          },
          error.status,
        );
      return result({ error: 'BCH submission status unavailable' }, 502);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (cancelled) request.signal.removeEventListener('abort', cancelled);
    }
  };
};
