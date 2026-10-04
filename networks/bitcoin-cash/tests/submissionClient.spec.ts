import { hashTransaction, hexToBin } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBitcoinCashSubmissionClient } from '../src/submissionClient';
import { decodeBitcoinCashSubmission } from '../src/submissionCodec';
import { signIntent, signingIntent } from './mocked/signing.mock';

/** Actual signed native body and bounded HTTP success response; fetch is always local and mocked. */
const fixture = () => {
  const intent = signingIntent();
  const signed = signIntent(intent);
  const txId = hashTransaction(hexToBin(signed));
  const metadata = {
    toChain: 'ethereum',
    toAddress: `0x${'12'.repeat(20)}`,
    bridgeFee: 100n,
    networkFee: 100n,
  };
  const fetcher = vi.fn<typeof globalThis.fetch>(async () => Response.json({ txId }));
  return { intent, signed, txId, metadata, fetcher };
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('createBitcoinCashSubmissionClient', () => {
  /**
   * @target createBitcoinCashSubmissionClient rejects settlement invalidated by %s
   * @dependencies Actual JSON parsing, signed transaction and a queued microtask invalidation.
   * @scenario Abort or expire the operation after parsing but before the outer race resumes.
   * @expected Reject the transaction ID with the exact fixed public message.
   */
  it.each(['abort', 'deadline'])('rejects settlement invalidated by %s', async (mutation) => {
    const value = fixture();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const controller = new AbortController();
    const parse = JSON.parse;
    vi.spyOn(JSON, 'parse').mockImplementation((...args: Parameters<typeof JSON.parse>) => {
      const result: unknown = parse(...args);
      if (result && typeof result === 'object' && 'txId' in result) {
        queueMicrotask(() => {
          if (mutation === 'abort') controller.abort();
          else now = 1200;
        });
      }
      return result;
    });
    await expect(
      createBitcoinCashSubmissionClient({ timeoutMs: 100, fetch: value.fetcher })(
        value.signed,
        value.intent,
        value.metadata,
        controller.signal,
      ),
    ).rejects.toThrow(/^BCH submission status unavailable$/);
    expect(value.fetcher).toHaveBeenCalledOnce();
  });
  /**
   * @target createBitcoinCashSubmissionClient submits a canonical intent to the dedicated route
   * @dependencies Actual signed validator, wire encoder and mocked Web response.
   * @scenario Submit one valid native lock.
   * @expected Encode exact intent, use same-origin credentials/no redirects and return the exact transaction ID.
   */
  it('submits a canonical intent to the dedicated route', async () => {
    const value = fixture();
    const submit = createBitcoinCashSubmissionClient({ timeoutMs: 1000, fetch: value.fetcher });
    expect(await submit(value.signed, value.intent, value.metadata)).toEqual(value.txId);
    expect(value.fetcher).toHaveBeenCalledWith(
      '/api/bitcoin-cash/submit',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        redirect: 'error',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      }),
    );
    const request = value.fetcher.mock.calls[0][1];
    if (typeof request?.body !== 'string') throw new Error('Missing request body fixture');
    expect(decodeBitcoinCashSubmission(request.body).intent).toEqual(value.intent);
  });
  /**
   * @target createBitcoinCashSubmissionClient rejects response %s
   * @dependencies Actual response streams with one independently changed field or bound.
   * @scenario Change status/media/hash/shape/declared length, exceed bytes or fragment count.
   * @expected Reject every response with the exact fixed status-unavailable message.
   */
  it.each(['status', 'type', 'hash', 'shape', 'length', 'bytes', 'chunks'])(
    'rejects response %s',
    async (mutation) => {
      const value = fixture();
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      const headers = new Headers({
        'content-type': mutation === 'type' ? 'text/plain' : 'application/json',
      });
      if (mutation === 'length') headers.set('content-length', '513');
      const body =
        mutation === 'chunks'
          ? new ReadableStream<Uint8Array>({
              pull(controller) {
                controller.enqueue(new Uint8Array());
              },
            })
          : mutation === 'bytes'
            ? ' '.repeat(513)
            : JSON.stringify(
                mutation === 'shape'
                  ? { txId: value.txId, diagnostic: 'arbitrary server detail' }
                  : { txId: mutation === 'hash' ? '00'.repeat(32) : value.txId },
              );
      value.fetcher.mockResolvedValue(
        new Response(body, { headers, status: mutation === 'status' ? 502 : 200 }),
      );
      await expect(
        createBitcoinCashSubmissionClient({ timeoutMs: 1000, fetch: value.fetcher })(
          value.signed,
          value.intent,
          value.metadata,
        ),
      ).rejects.toThrow(/^BCH submission status unavailable$/);
    },
  );
  /**
   * @target createBitcoinCashSubmissionClient rejects before fetch %s
   * @dependencies Actual native signed validator and a pre-aborted signal.
   * @scenario Alter signed bytes or abort before entry.
   * @expected Reject with fixed text and leave fetch untouched.
   */
  it.each(['signature', 'abort'])('rejects before fetch %s', async (mutation) => {
    const value = fixture();
    const controller = new AbortController();
    if (mutation === 'abort') controller.abort();
    await expect(
      createBitcoinCashSubmissionClient({ timeoutMs: 1000, fetch: value.fetcher })(
        mutation === 'signature' ? `${value.signed.slice(0, -2)}01` : value.signed,
        value.intent,
        value.metadata,
        controller.signal,
      ),
    ).rejects.toThrow(/^BCH submission status unavailable$/);
    expect(value.fetcher).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionClient rejects overdue validation before starting fetch
   * @dependencies Controlled clock advanced after initial operation/entry checks.
   * @scenario Cross the deadline while validating a bounded signed body, without timer dispatch.
   * @expected Reject before fetch begins.
   */
  it('rejects overdue validation before starting fetch', async () => {
    const value = fixture();
    let calls = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => (calls++ < 2 ? 1000 : 1200));
    await expect(
      createBitcoinCashSubmissionClient({ timeoutMs: 100, fetch: value.fetcher })(
        value.signed,
        value.intent,
        value.metadata,
      ),
    ).rejects.toThrow(/^BCH submission status unavailable$/);
    expect(value.fetcher).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionClient cleans up a late response after caller cancellation
   * @dependencies Pending mocked fetch, actual late response stream and original AbortController.
   * @scenario Abort during fetch, then return a previously pending successful response.
   * @expected Propagate abort, reject fixed text and cancel the late body without accepting its ID.
   */
  it('cleans up a late response after caller cancellation', async () => {
    const value = fixture();
    let release: ((response: Response) => void) | undefined;
    let entered: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    value.fetcher.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
          entered?.();
        }),
    );
    const controller = new AbortController();
    const pending = createBitcoinCashSubmissionClient({ timeoutMs: 1000, fetch: value.fetcher })(
      value.signed,
      value.intent,
      value.metadata,
      controller.signal,
    );
    await waiting;
    controller.abort();
    await expect(pending).rejects.toThrow(/^BCH submission status unavailable$/);
    expect(value.fetcher.mock.calls[0][1]?.signal?.aborted).toEqual(true);
    const cancel = vi.fn();
    release?.(
      new Response(new ReadableStream<Uint8Array>({ cancel }), {
        headers: { 'content-type': 'application/json' },
      }),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(cancel).toHaveBeenCalledOnce();
  });
  /**
   * @target createBitcoinCashSubmissionClient aborts and cancels a response that never completes
   * @dependencies Real pending response stream, mocked fetch and fake timers.
   * @scenario Return headers but no response bytes before the deadline.
   * @expected Reject promptly, abort fetch authority and cancel the unread stream.
   */
  it('aborts and cancels a response that never completes', async () => {
    const value = fixture();
    vi.useFakeTimers();
    const cancel = vi.fn();
    let entered: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    value.fetcher.mockResolvedValue(
      new Response(
        new ReadableStream<Uint8Array>({
          pull() {
            entered?.();
          },
          cancel,
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );
    const pending = createBitcoinCashSubmissionClient({ timeoutMs: 100, fetch: value.fetcher })(
      value.signed,
      value.intent,
      value.metadata,
    );
    const rejected = expect(pending).rejects.toThrow(/^BCH submission status unavailable$/);
    await waiting;
    await vi.advanceTimersByTimeAsync(100);
    await rejected;
    expect(value.fetcher.mock.calls[0][1]?.signal?.aborted).toEqual(true);
    expect(cancel).toHaveBeenCalledOnce();
  });
});
