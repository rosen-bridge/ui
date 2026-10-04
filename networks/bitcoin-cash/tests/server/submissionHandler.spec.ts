import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BitcoinCashSubmissionPort } from '../../src/server/submissionHandler';
import { createBitcoinCashSubmissionHandler } from '../../src/server/submissionHandler';
import { encodeBitcoinCashSubmission } from '../../src/submissionCodec';
import { signIntent, signingIntent } from '../mocked/signing.mock';

/** Canonical signed native payload and real same-origin HTTP request; the submit port performs no network work. */
const fixture = () => {
  const intent = signingIntent();
  const destination = { toChain: 'ethereum', toAddress: `0x${'12'.repeat(20)}` };
  const signedTransactionHex = signIntent(intent);
  const body = encodeBitcoinCashSubmission({ intent, destination, signedTransactionHex });
  const submitTransaction = vi.fn<BitcoinCashSubmissionPort['submitTransaction']>(async () =>
    'aa'.repeat(32),
  );
  const getRuntime = vi.fn(() => ({ submitTransaction }));
  /** Construct a same-origin POST with explicit headers and an optional abort signal. */
  const request = (
    headers: HeadersInit = {
      origin: 'https://bridge.example.org',
      'content-type': 'application/json',
    },
    signal?: AbortSignal,
  ) =>
    new Request('https://bridge.example.org/api/bitcoin-cash/submit', {
      method: 'POST',
      headers,
      body,
      signal,
    });
  return {
    intent,
    destination,
    signedTransactionHex,
    body,
    submitTransaction,
    getRuntime,
    request,
  };
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('createBitcoinCashSubmissionHandler', () => {
  /**
   * @target createBitcoinCashSubmissionHandler forwards a decoded signed body and the request signal
   * @dependencies Actual request decoder, signed fixture and trusted typed submission port.
   * @scenario Submit a bounded same-origin envelope.
   * @expected Forward exact bytes, intent, destination and signal; return only the transaction identifier.
   */
  it('forwards a decoded signed body and the request signal', async () => {
    const value = fixture();
    const request = value.request();
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(request);
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ txId: 'aa'.repeat(32) });
    expect(value.submitTransaction).toHaveBeenCalledWith(
      value.signedTransactionHex,
      value.intent,
      value.destination,
      expect.any(AbortSignal),
      expect.any(Number),
    );
    expect(response.headers.get('cache-control')).toEqual('no-store');
  });
  /**
   * @target createBitcoinCashSubmissionHandler rejects origin %s
   * @dependencies Actual same-origin URL with one independent Origin change.
   * @scenario Remove Origin or provide a different origin.
   * @expected Reject with status403 before constructing server ports.
   */
  it.each([undefined, 'https://foreign.example.org'])('rejects origin %s', async (origin) => {
    const value = fixture();
    const headers = new Headers({ 'content-type': 'application/json' });
    if (origin) headers.set('origin', origin);
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(value.request(headers));
    expect(response.status).toEqual(403);
    expect(value.getRuntime).not.toHaveBeenCalled();
    expect(value.submitTransaction).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionHandler rejects runtime %s
   * @dependencies Disabled runtime or rejecting configuration constructor.
   * @scenario Return no runtime or throw an arbitrary configuration diagnostic.
   * @expected Return exactly503 without submitting signed bytes.
   */
  it.each(['disabled', 'invalid'])('rejects runtime %s', async (state) => {
    const value = fixture();
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: () => {
        if (state === 'invalid') throw new Error('arbitrary configuration diagnostic');
        return undefined;
      },
    })(value.request());
    expect(response.status).toEqual(503);
    expect(await response.json()).toEqual({ error: 'BCH bridge unavailable' });
    expect(value.submitTransaction).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionHandler preserves framing rejection %s
   * @dependencies Actual dedicated body reader and isolated wrong media type/declared byte limit.
   * @scenario Replace media type or exceed the declared five-megabyte limit.
   * @expected Return400 or413 with fixed request text and no submission.
   */
  it.each(['type', 'length'])('preserves framing rejection %s', async (mutation) => {
    const value = fixture();
    const headers = new Headers({
      origin: 'https://bridge.example.org',
      'content-type': mutation === 'type' ? 'text/plain' : 'application/json',
    });
    if (mutation === 'length') headers.set('content-length', '5000001');
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(value.request(headers));
    expect(response.status).toEqual(mutation === 'type' ? 400 : 413);
    expect(await response.json()).toEqual({ error: 'BCH submission request rejected' });
    expect(value.submitTransaction).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionHandler rejects an aborted request before submission
   * @dependencies Actual aborted Request and bounded decoder.
   * @scenario Abort before handling a valid signed envelope.
   * @expected Return400 and never invoke the server submit port.
   */
  it('rejects an aborted request before submission', async () => {
    const value = fixture();
    const controller = new AbortController();
    controller.abort();
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(value.request(undefined, controller.signal));
    expect(response.status).toEqual(400);
    expect(value.submitTransaction).not.toHaveBeenCalled();
  });
  /**
   * @target createBitcoinCashSubmissionHandler sanitizes submission %s
   * @dependencies Failing dedicated submit port with arbitrary diagnostics or invalid transaction identifier.
   * @scenario Throw a private marker or return malformed output.
   * @expected Return exactly502 and a fixed public submission error.
   */
  it.each(['error', 'identifier'])('sanitizes submission %s', async (mutation) => {
    const value = fixture();
    if (mutation === 'error')
      value.submitTransaction.mockRejectedValue(new Error('arbitrary provider diagnostic'));
    else value.submitTransaction.mockResolvedValue('invalid');
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(value.request());
    expect(response.status).toEqual(502);
    expect(await response.json()).toEqual({ error: 'BCH submission status unavailable' });
  });
  /**
   * @target createBitcoinCashSubmissionHandler rejects a total deadline exceeded across body and submission
   * @dependencies Real JSON decoder and controlled clock advanced by two individually valid phases.
   * @scenario Spend sixty milliseconds decoding and sixty submitting under a hundred-millisecond budget.
   * @expected Reject the overdue result with408 and abort its signal without claiming retroactive cancellation.
   */
  it('rejects a total deadline exceeded across body and submission', async () => {
    const value = fixture();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const parse = JSON.parse;
    vi.spyOn(JSON, 'parse').mockImplementation((text, reviver) => {
      const decoded = parse(text, reviver);
      now += 60;
      return decoded;
    });
    let submittedSignal: AbortSignal | undefined;
    value.submitTransaction.mockImplementation(async (_signed, _intent, _destination, signal) => {
      submittedSignal = signal;
      now += 60;
      return 'aa'.repeat(32);
    });
    const response = await createBitcoinCashSubmissionHandler({
      timeoutMs: 100,
      getRuntime: value.getRuntime,
    })(value.request());
    expect(response.status).toEqual(408);
    expect(submittedSignal?.aborted).toEqual(true);
    expect(await response.json()).toEqual({ error: 'BCH submission status unavailable' });
  });
  /**
   * @target createBitcoinCashSubmissionHandler aborts a pending submission on total timeout
   * @dependencies Pending trusted port and fake timers.
   * @scenario Leave submission unresolved until the whole endpoint deadline expires.
   * @expected Return408 promptly and abort the passed signal before any later port result is accepted.
   */
  it('aborts a pending submission on total timeout', async () => {
    const value = fixture();
    vi.useFakeTimers();
    let entered: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    let submittedSignal: AbortSignal | undefined;
    value.submitTransaction.mockImplementation((_signed, _intent, _destination, signal) => {
      submittedSignal = signal;
      entered?.();
      return new Promise(() => {});
    });
    const pending = createBitcoinCashSubmissionHandler({
      timeoutMs: 100,
      getRuntime: value.getRuntime,
    })(value.request());
    await waiting;
    await vi.advanceTimersByTimeAsync(100);
    const response = await pending;
    expect(response.status).toEqual(408);
    expect(submittedSignal?.aborted).toEqual(true);
  });
  /**
   * @target createBitcoinCashSubmissionHandler propagates cancellation after decoding
   * @dependencies Pending trusted port and a real AbortController.
   * @scenario Abort the request after submission starts.
   * @expected Reject promptly, propagate abort and report unavailable status rather than a false broadcast rollback.
   */
  it('propagates cancellation after decoding', async () => {
    const value = fixture();
    let entered: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    let submittedSignal: AbortSignal | undefined;
    value.submitTransaction.mockImplementation((_signed, _intent, _destination, signal) => {
      submittedSignal = signal;
      entered?.();
      return new Promise(() => {});
    });
    const controller = new AbortController();
    const pending = createBitcoinCashSubmissionHandler({
      timeoutMs: 1000,
      getRuntime: value.getRuntime,
    })(value.request(undefined, controller.signal));
    await waiting;
    controller.abort();
    const response = await pending;
    expect(response.status).toEqual(400);
    expect(submittedSignal?.aborted).toEqual(true);
    expect(await response.json()).toEqual({ error: 'BCH submission status unavailable' });
  });
});
