import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  signIntent,
  signingIntent,
} from '../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import {
  BitcoinCashSubmissionRequestError,
  readBitcoinCashSubmissionBody,
} from '../../../src/networks/bitcoin-cash/submissionBody';
import { encodeBitcoinCashSubmission } from '../../../src/networks/bitcoin-cash/submissionCodec';

/** Exact valid native JSON envelope; no server submit or network transport is initialized. */
const fixture = () => {
  const intent = signingIntent();
  return encodeBitcoinCashSubmission({
    intent,
    signedTransactionHex: signIntent(intent),
    destination: { toChain: 'ethereum', toAddress: `0x${'12'.repeat(20)}` },
  });
};

/** Construct an actual Web Request around a controlled body stream. */
const request = (
  body: ReadableStream<Uint8Array> | string,
  headers: HeadersInit = { 'content-type': 'application/json' },
  signal?: AbortSignal,
) => {
  const options: RequestInit & { duplex: 'half' } = {
    method: 'POST',
    body,
    headers,
    signal,
    duplex: 'half',
  };
  return new Request('http://localhost/api/bitcoin-cash/submit', options);
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('readBitcoinCashSubmissionBody', () => {
  /**
   * @target Dedicated body reader preserves a valid envelope across multiple transport chunks.
   * @dependencies Actual Request/ReadableStream and canonical signed fixture.
   * @scenario Deliver the payload in two chunks under one deadline.
   * @expected Decode exact amount and parent context without network submission.
   */
  it('reads a bounded fragmented body', async () => {
    const body = new TextEncoder().encode(fixture());
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(body.slice(0, 100));
        controller.enqueue(body.slice(100));
        controller.close();
      },
    });
    const result = await readBitcoinCashSubmissionBody(request(stream), 1000);
    expect(result.intent.amount).toEqual(50000n);
    expect(result.intent.selectedUtxos).toHaveLength(1);
  });
  /**
   * @target Header, byte and chunk bounds reject without promoting an untrusted parsed body.
   * @dependencies Actual body streams with one independent rejected framing boundary.
   * @scenario Change media type/declared length, exceed bytes or exceed fragment count.
   * @expected Reject with fixed public text and cancel the stream.
   */
  it.each(['type', 'length', 'bytes', 'chunks'])('rejects body framing %s', async (mutation) => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    const cancel = vi.fn();
    let count = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (mutation === 'bytes') controller.enqueue(new Uint8Array(5_000_001));
        else if (mutation === 'chunks') controller.enqueue(new Uint8Array([0x20]));
        else {
          controller.enqueue(new TextEncoder().encode(fixture()));
          controller.close();
        }
        count += 1;
      },
      cancel,
    });
    const headers = new Headers({
      'content-type': mutation === 'type' ? 'text/plain' : 'application/json',
    });
    if (mutation === 'length') headers.set('content-length', '5000001');
    await expect(
      readBitcoinCashSubmissionBody(request(stream, headers), 1000),
    ).rejects.toMatchObject({
      status: mutation === 'type' ? 400 : 413,
      message: 'BCH submission request rejected',
    });
    expect(cancel).toHaveBeenCalledOnce();
    if (mutation === 'chunks') expect(count).toBeLessThanOrEqual(10002);
  });
  /**
   * @target Stream errors never reveal arbitrary diagnostics to the HTTP consumer.
   * @dependencies A rejecting Web body stream.
   * @scenario Fail a read with a marker that must not appear in the public message.
   * @expected Reject exactly the fixed request message.
   */
  it('sanitizes stream failures', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull() {
        throw new Error('sensitive stream detail');
      },
    });
    await expect(readBitcoinCashSubmissionBody(request(stream), 1000)).rejects.toThrow(
      /^BCH submission request rejected$/,
    );
  });
  /**
   * @target A single absolute deadline rejects overdue chunks even without dispatching the timeout timer.
   * @dependencies Controlled clock and delayed Web stream pull.
   * @scenario Advance wall time past the deadline before returning an otherwise valid chunk.
   * @expected Reject as timeout and cancel the late stream.
   */
  it('rejects overdue data before timer callbacks run', async () => {
    const body = new TextEncoder().encode(fixture());
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        now += 1000;
        controller.enqueue(body);
      },
      cancel,
    });
    const operation = readBitcoinCashSubmissionBody(request(stream), 100);
    await expect(operation).rejects.toMatchObject({ status: 408 });
    expect(cancel).toHaveBeenCalledOnce();
  });
  /**
   * @target Parsed data cannot be promoted after the absolute body deadline.
   * @dependencies Real JSON parsing with a controlled clock advanced after decoding.
   * @scenario Parse a valid body, then cross the deadline without dispatching timers.
   * @expected Reject with timeout status after decoding rather than accepting the envelope.
   */
  it('rejects decoding that completes after the deadline', async () => {
    const body = fixture();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const parse = JSON.parse;
    vi.spyOn(JSON, 'parse').mockImplementation((text, reviver) => {
      const value = parse(text, reviver);
      now += 1000;
      return value;
    });
    await expect(readBitcoinCashSubmissionBody(request(body), 100)).rejects.toMatchObject({
      status: 408,
      message: 'BCH submission request rejected',
    });
  });
  /**
   * @target Abort while waiting for body data ends the operation without accepting later contents.
   * @dependencies Pending stream and explicit AbortController.
   * @scenario Abort before any body chunk arrives.
   * @expected Reject and cancel the stream with the fixed public error.
   */
  it('rejects cancellation during a pending read', async () => {
    const controller = new AbortController();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ pull() {}, cancel });
    const operation = readBitcoinCashSubmissionBody(
      request(stream, undefined, controller.signal),
      1000,
    );
    controller.abort();
    await expect(operation).rejects.toBeInstanceOf(BitcoinCashSubmissionRequestError);
    expect(cancel).toHaveBeenCalledOnce();
  });
});
