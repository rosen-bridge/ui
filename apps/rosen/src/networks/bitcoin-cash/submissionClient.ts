import { validateBitcoinCashSignedLock } from '@rosen-network/bitcoin-cash';
import type { BitcoinCashNetworkConfig } from '@rosen-network/bitcoin-cash/client';

import { decodeBitcoinCashSubmission, encodeBitcoinCashSubmission } from './submissionCodec';

/** Build a bounded same-origin browser port with one deadline for encode, request and response. */
export const createBitcoinCashSubmissionClient = (options: {
  timeoutMs: number;
  fetch?: typeof globalThis.fetch;
}): BitcoinCashNetworkConfig['submitTransaction'] => {
  if (
    !Number.isSafeInteger(options.timeoutMs) ||
    options.timeoutMs < 1 ||
    options.timeoutMs > 30000
  )
    throw new Error('Invalid BCH submission deadline');
  const timeoutMs = options.timeoutMs;
  const fetcher = options.fetch ?? globalThis.fetch;

  /** Submit canonical signed intent; never echo server diagnostics or accept a mismatched transaction ID. */
  return async (signedHex, intent, metadata, originalSignal) => {
    const deadline = Date.now() + timeoutMs;
    const expired = new AbortController();
    const signal = originalSignal
      ? AbortSignal.any([originalSignal, expired.signal])
      : expired.signal;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled: (() => void) | undefined;
    let response: Response | undefined;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    /** Reject invalidated work before further reads and before accepting synchronous parsing results. */
    const active = () => {
      if (Date.now() >= deadline) expired.abort();
      if (signal.aborted) throw new Error('BCH submission status unavailable');
    };
    /** Cancel both current and late HTTP response bodies without exposing cleanup diagnostics. */
    const cleanup = () => {
      try {
        if (reader) {
          void reader.cancel().catch(() => undefined);
          reader.releaseLock();
        } else {
          void response?.body?.cancel().catch(() => undefined);
        }
      } catch {
        // A released stream cannot authorize a result or another request.
      }
    };
    try {
      active();
      const body = encodeBitcoinCashSubmission({
        signedTransactionHex: signedHex,
        intent,
        destination: metadata,
      });
      const copied = decodeBitcoinCashSubmission(body);
      const expected = validateBitcoinCashSignedLock(
        copied.signedTransactionHex,
        copied.intent,
      ).txId;
      active();
      const cancellation = new Promise<never>((_resolve, reject) => {
        cancelled = () => reject(new Error('BCH submission status unavailable'));
        signal.addEventListener('abort', cancelled, { once: true });
        timer = setTimeout(() => expired.abort(), deadline - Date.now());
      });
      /** Read and validate the bounded response before publishing its transaction ID. */
      const work = async () => {
        try {
          active();
          response = await fetcher('/api/bitcoin-cash/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
            credentials: 'same-origin',
            cache: 'no-store',
            redirect: 'error',
            signal,
          });
          active();
          if (
            response.status !== 200 ||
            !response.body ||
            !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
              response.headers.get('content-type') ?? '',
            )
          )
            throw new Error('BCH submission status unavailable');
          const declaredLength = response.headers.get('content-length');
          if (
            declaredLength !== null &&
            (!/^[0-9]{1,3}$/.test(declaredLength) || Number(declaredLength) > 512)
          )
            throw new Error('BCH submission status unavailable');
          reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let bytes = 0;
          while (true) {
            active();
            const chunk = await reader.read();
            active();
            if (chunk.done) break;
            if (!(chunk.value instanceof Uint8Array) || chunk.value.some((byte) => byte > 0x7f))
              throw new Error('BCH submission status unavailable');
            bytes += chunk.value.byteLength;
            if (bytes > 512 || chunks.length >= 1024)
              throw new Error('BCH submission status unavailable');
            chunks.push(chunk.value.slice());
          }
          const bytesReceived = new Uint8Array(bytes);
          let offset = 0;
          for (const chunk of chunks) {
            bytesReceived.set(chunk, offset);
            offset += chunk.byteLength;
          }
          const result: unknown = JSON.parse(new TextDecoder().decode(bytesReceived));
          active();
          if (
            !result ||
            typeof result !== 'object' ||
            Array.isArray(result) ||
            Object.keys(result).length !== 1 ||
            !('txId' in result) ||
            result.txId !== expected
          )
            throw new Error('BCH submission status unavailable');
          return expected;
        } finally {
          cleanup();
        }
      };
      const result = await Promise.race([work(), cancellation]);
      active();
      return result;
    } catch {
      throw new Error('BCH submission status unavailable');
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      if (cancelled) signal.removeEventListener('abort', cancelled);
      cleanup();
    }
  };
};
