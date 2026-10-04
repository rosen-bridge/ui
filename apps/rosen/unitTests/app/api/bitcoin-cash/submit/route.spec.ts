import { NextRequest } from 'next/server';

import { hashTransaction, hexToBin } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { encodeBitcoinCashSubmission } from '@rosen-network/bitcoin-cash/submission';

import {
  signIntent,
  signingIntent,
} from '../../../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import { POST } from '../../../../../src/app/api/bitcoin-cash/submit/route';

const { state, getRuntime, submit } = vi.hoisted(() => ({
  state: { enabled: true },
  getRuntime: vi.fn(),
  submit: vi.fn(),
}));
vi.mock('../../../../../src/networks/bitcoin-cash/publicConfig', () => ({
  get bitcoinCashPublicConfig() {
    return state.enabled ? { walletTimeoutMs: 100 } : undefined;
  },
}));
vi.mock('../../../../../src/networks/bitcoin-cash/serverConfig', () => ({
  getBitcoinCashServerRuntime: getRuntime,
}));

/** Actual Next request and signed native payload; server submission remains a local typed test port. */
const fixture = () => {
  const intent = signingIntent();
  const signedTransactionHex = signIntent(intent);
  const txId = hashTransaction(hexToBin(signedTransactionHex));
  const destination = { toChain: 'ethereum', toAddress: `0x${'12'.repeat(20)}` };
  const body = encodeBitcoinCashSubmission({ signedTransactionHex, intent, destination });
  getRuntime.mockReturnValue({ submitTransaction: submit });
  submit.mockResolvedValue(txId);
  vi.spyOn(Date, 'now').mockReturnValue(1000);
  return { body, txId, intent, signedTransactionHex, destination };
};

afterEach(() => {
  state.enabled = true;
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('POST', () => {
  /**
   * @target POST joins the actual Next request to the bounded submission handler
   * @dependencies NextRequest, real handler/body/codec and local submission port.
   * @scenario Submit one same-origin signed lock to the production POST export.
   * @expected Return its exact transaction ID and forward absolute deadline 1100 plus a live abort signal.
   */
  it('joins the actual Next request to the bounded submission handler', async () => {
    const value = fixture();
    const response = await POST(
      new NextRequest('https://bridge.example/api/bitcoin-cash/submit', {
        method: 'POST',
        headers: { origin: 'https://bridge.example', 'content-type': 'application/json' },
        body: value.body,
      }),
    );
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ txId: value.txId });
    expect(response.headers.get('cache-control')).toEqual('no-store');
    expect(submit).toHaveBeenCalledWith(
      value.signedTransactionHex,
      value.intent,
      value.destination,
      expect.any(AbortSignal),
      1100,
    );
  });
  /**
   * @target POST rejects disabled availability before server construction
   * @dependencies Production POST export and no enabled public configuration.
   * @scenario Submit the valid native fixture with BCH disabled.
   * @expected Return exact unavailable 503 without constructing runtime or invoking submit.
   */
  it('rejects disabled availability before server construction', async () => {
    const value = fixture();
    state.enabled = false;
    const response = await POST(
      new NextRequest('https://bridge.example/api/bitcoin-cash/submit', {
        method: 'POST',
        headers: { origin: 'https://bridge.example', 'content-type': 'application/json' },
        body: value.body,
      }),
    );
    expect(response.status).toEqual(503);
    expect(await response.json()).toEqual({ error: 'BCH bridge unavailable' });
    expect(getRuntime).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
  /**
   * @target POST rejects Next request %s before submission
   * @dependencies Actual NextRequest with one independently changed request boundary.
   * @scenario Change origin, declare 5000001 bytes or abort before route entry.
   * @expected Return exact 403/413/400 respectively without submitting any signed transaction.
   */
  it.each(['origin', 'length', 'abort'])(
    'rejects Next request %s before submission',
    async (mutation) => {
      const value = fixture();
      const controller = new AbortController();
      if (mutation === 'abort') controller.abort();
      const headers: Record<string, string> = {
        origin: mutation === 'origin' ? 'https://other.example' : 'https://bridge.example',
        'content-type': 'application/json',
      };
      if (mutation === 'length') headers['content-length'] = '5000001';
      const response = await POST(
        new NextRequest('https://bridge.example/api/bitcoin-cash/submit', {
          method: 'POST',
          headers,
          body: value.body,
          signal: controller.signal,
        }),
      );
      expect(response.status).toEqual(
        mutation === 'origin' ? 403 : mutation === 'length' ? 413 : 400,
      );
      expect(submit).not.toHaveBeenCalled();
      if (mutation === 'origin') expect(getRuntime).not.toHaveBeenCalled();
    },
  );
});
