import {
  BITCOIN_CASH_SUBMISSION_BODY_BYTES,
  decodeBitcoinCashSubmission,
} from '../submissionCodec';

/** Public HTTP status only; source errors and untrusted request contents never enter the message. */
export class BitcoinCashSubmissionRequestError extends Error {
  /** Store a fixed public message and bounded HTTP rejection status. */
  constructor(readonly status: 400 | 408 | 413) {
    super('BCH submission request rejected');
  }
}

/** Read the dedicated JSON envelope with byte/chunk limits and one absolute operation deadline. */
export const readBitcoinCashSubmissionBody = async (request: Request, timeoutMs: number) => {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000)
    throw new BitcoinCashSubmissionRequestError(400);
  const deadline = Date.now() + timeoutMs;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    if (
      !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
        request.headers.get('content-type') ?? '',
      )
    )
      throw new BitcoinCashSubmissionRequestError(400);
    const length = request.headers.get('content-length');
    if (length !== null) {
      if (!/^[0-9]{1,7}$/.test(length)) throw new BitcoinCashSubmissionRequestError(400);
      if (Number(length) > BITCOIN_CASH_SUBMISSION_BODY_BYTES)
        throw new BitcoinCashSubmissionRequestError(413);
    }
    if (!request.body) throw new BitcoinCashSubmissionRequestError(400);
    reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      if (request.signal.aborted) throw new BitcoinCashSubmissionRequestError(400);
      if (Date.now() >= deadline) throw new BitcoinCashSubmissionRequestError(408);
      let timer: ReturnType<typeof setTimeout> | undefined;
      let aborted: (() => void) | undefined;
      let result: ReadableStreamReadResult<Uint8Array>;
      try {
        result = await Promise.race([
          reader.read(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () => reject(new BitcoinCashSubmissionRequestError(408)),
              deadline - Date.now(),
            );
            aborted = () => reject(new BitcoinCashSubmissionRequestError(400));
            request.signal.addEventListener('abort', aborted, { once: true });
            if (request.signal.aborted) aborted();
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
        if (aborted) request.signal.removeEventListener('abort', aborted);
      }
      if (request.signal.aborted) throw new BitcoinCashSubmissionRequestError(400);
      if (Date.now() >= deadline) throw new BitcoinCashSubmissionRequestError(408);
      if (result.done) break;
      if (!(result.value instanceof Uint8Array)) throw new BitcoinCashSubmissionRequestError(400);
      bytes += result.value.byteLength;
      if (bytes > BITCOIN_CASH_SUBMISSION_BODY_BYTES || chunks.length >= 10000)
        throw new BitcoinCashSubmissionRequestError(413);
      if (result.value.some((byte) => byte > 0x7f))
        throw new BitcoinCashSubmissionRequestError(400);
      chunks.push(result.value.slice());
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const decoded = decodeBitcoinCashSubmission(
      new TextDecoder('utf-8', { fatal: true }).decode(body),
    );
    if (Date.now() >= deadline) throw new BitcoinCashSubmissionRequestError(408);
    return decoded;
  } catch (error) {
    if (error instanceof BitcoinCashSubmissionRequestError) throw error;
    throw new BitcoinCashSubmissionRequestError(400);
  } finally {
    if (reader) {
      void reader.cancel().catch(() => undefined);
      reader.releaseLock();
    } else {
      void request.body?.cancel().catch(() => undefined);
    }
  }
};
