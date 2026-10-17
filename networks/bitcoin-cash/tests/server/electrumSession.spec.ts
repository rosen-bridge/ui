import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BitcoinCashElectrumSession, ELECTRUM_LIMITS } from '../../src/server/electrumSession';
import { signIntent, signingIntent } from '../testUtils';

const mocked = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock('node:tls', () => ({ connect: mocked.connect }));

/** Simulates TLS readiness, data and failures without creating network traffic. */
class MockSocket extends EventEmitter {
  authorized = true;
  /** Records one offline write without acquiring a transport. */
  write = vi.fn(() => true);
  /** Records teardown and preserves the mock socket identity. */
  destroy = vi.fn(() => this);
}

/** Explicit TLS Electrum endpoint used by the offline socket mock. */
const config = { hostname: 'bch-indexer.example', port: 50002 };
let socket: MockSocket;

/** Encodes one offline newline-delimited JSON-RPC response for the selected id. */
const reply = (id: number, result: unknown): Buffer =>
  Buffer.from(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);

/** Computes fixture identity independently with native double-SHA256. */
const hash = (hex: string): string => {
  const first = createHash('sha256').update(Buffer.from(hex, 'hex')).digest();
  return createHash('sha256').update(first).digest().reverse().toString('hex');
};

beforeEach(() => {
  socket = new MockSocket();
  mocked.connect.mockReset().mockImplementation(() => {
    queueMicrotask(() => socket.emit('secureConnect'));
    return socket;
  });
});

afterEach(() => vi.useRealTimers());

describe('BitcoinCashElectrumSession', () => {
  describe('open', () => {
    /**
     * @target BitcoinCashElectrumSession.open rejects invalid enclosing deadline %s
     * @dependencies trusted deadline validation and mocked TLS
     * @scenario supply one malformed absolute enclosing deadline
     * @expected rejection occurs before socket acquisition
     */
    it.each([0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '1100'])(
      'rejects invalid enclosing deadline %s',
      async (deadline) => {
        await expect(
          BitcoinCashElectrumSession.open(config, undefined, deadline as number),
        ).rejects.toThrow('server configuration');
        expect(mocked.connect).not.toHaveBeenCalled();
      },
    );

    /**
     * @target BitcoinCashElectrumSession.open rejects an expired enclosing read budget
     * @dependencies actual clock moved without dispatching timers and mocked TLS
     * @scenario an enclosing request budget expired during the preceding quote
     * @expected no read socket is acquired
     */
    it('rejects an expired enclosing read budget', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1200);
      await expect(BitcoinCashElectrumSession.open(config, undefined, 1100)).rejects.toThrow(
        'timed out',
      );
      expect(mocked.connect).not.toHaveBeenCalled();
    });

    /**
     * @target BitcoinCashElectrumSession.open rechecks the enclosing deadline after socket acquisition
     * @dependencies offline socket acquisition and Date-only advancement
     * @scenario the enclosing budget expires inside socket acquisition
     * @expected readiness rejects and the acquired socket and timers are released
     */
    it('rechecks the enclosing deadline after socket acquisition', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(1000);
      mocked.connect.mockImplementation(() => {
        vi.setSystemTime(1100);
        return socket;
      });
      await expect(BitcoinCashElectrumSession.open(config, undefined, 1100)).rejects.toThrow(
        'timed out',
      );
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.open rejects expiry between validation and constructor entry without acquiring TLS
     * @dependencies two distinct Date samples and mocked TLS
     * @scenario the budget expires between factory validation and constructor entry
     * @expected the constructor rejects its already-expired budget before acquiring TLS
     */
    it('rejects expiry between validation and constructor entry without acquiring TLS', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      const clock = vi.spyOn(Date, 'now').mockReturnValue(1100).mockReturnValueOnce(1000);
      try {
        await expect(BitcoinCashElectrumSession.open(config, undefined, 1100)).rejects.toThrow(
          'timed out',
        );
        expect(mocked.connect).not.toHaveBeenCalled();
        expect(socket.write).not.toHaveBeenCalled();
        expect(socket.destroy).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toEqual(0);
      } finally {
        clock.mockRestore();
      }
    });

    /**
     * @target BitcoinCashElectrumSession.open clamps the operation timer to the remaining enclosing budget
     * @dependencies offline ready TLS and fake timers
     * @scenario the enclosing deadline leaves less time than the endpoint timeout
     * @expected the owned operation timer expires at the remaining enclosing budget
     */
    it('clamps the operation timer to the remaining enclosing budget', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(1000);
      const session = await BitcoinCashElectrumSession.open(config, undefined, 1050);
      const request = session.request('server.version', []);
      const rejection = expect(request).rejects.toThrow('operation timed out');
      await vi.advanceTimersByTimeAsync(50);
      await rejection;
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.open keeps the shorter endpoint deadline
     * @dependencies Date-only expiry and a shorter configured local timeout
     * @scenario a later enclosing deadline is supplied to a bounded endpoint
     * @expected the enclosing deadline cannot extend the endpoint operation limit
     */
    it('keeps the shorter endpoint deadline', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(1000);
      const session = await BitcoinCashElectrumSession.open(
        { ...config, timeoutMs: 100 },
        undefined,
        2000,
      );
      vi.setSystemTime(1100);
      expect(() => session.checkDeadline()).toThrow('expired');
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
    /**
     * @target BitcoinCashElectrumSession.open rejects cancellation after TLS readiness before publishing the session
     * @dependencies native cancellation and a verified offline TLS socket
     * @scenario secureConnect resolves readiness then aborts in the same microtask
     * @expected open rejects before publishing the closed session and cleanup is complete
     */
    it('rejects cancellation after TLS readiness before publishing the session', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const controller = new AbortController();
      mocked.connect.mockImplementation(() => {
        queueMicrotask(() => {
          socket.emit('secureConnect');
          controller.abort();
        });
        return socket;
      });
      await expect(BitcoinCashElectrumSession.open(config, controller.signal)).rejects.toThrow(
        'cancelled',
      );
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
    /**
     * @target BitcoinCashElectrumSession.open rejects pre-cancelled work before acquiring a socket
     * @dependencies native AbortController and mocked TLS
     * @scenario cancel before opening the configured endpoint
     * @expected no socket is acquired and the caller reason is hidden
     */
    it('rejects pre-cancelled work before acquiring a socket', async () => {
      const controller = new AbortController();
      controller.abort('private cancellation marker');
      await expect(BitcoinCashElectrumSession.open(config, controller.signal)).rejects.toThrow(
        'BCH Electrum operation cancelled',
      );
      expect(mocked.connect).not.toHaveBeenCalled();
    });

    /**
     * @target BitcoinCashElectrumSession.open closes a socket cancelled during acquisition
     * @dependencies native AbortController, mocked TLS and fake timers
     * @scenario cancellation occurs inside socket acquisition before listener attachment
     * @expected readiness rejects and all acquired resources are released once
     */
    it('closes a socket cancelled during acquisition', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const controller = new AbortController();
      mocked.connect.mockImplementation(() => {
        controller.abort();
        return socket;
      });
      await expect(BitcoinCashElectrumSession.open(config, controller.signal)).rejects.toThrow(
        'cancelled',
      );
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.open rejects an invalid cancellation signal
     * @dependencies server option validation and mocked TLS
     * @scenario supply a plain object instead of a native cancellation signal
     * @expected the malformed signal is rejected before socket acquisition
     */
    it('rejects an invalid cancellation signal', async () => {
      await expect(BitcoinCashElectrumSession.open(config, {} as AbortSignal)).rejects.toThrow(
        'server configuration',
      );
      expect(mocked.connect).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashElectrumSession.open requires verified TLS and cleans up its owned resources
     * @dependencies TLS connect mocked; no socket or network traffic.
     * @scenario Open an authorized endpoint and then release its session.
     * @expected TLS CA/hostname verification, TLS1.2 minimum, and cleanup.
     */
    it('requires verified TLS and cleans up its owned resources', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const session = await BitcoinCashElectrumSession.open(config);
      expect(mocked.connect).toHaveBeenCalledWith({
        host: config.hostname,
        port: config.port,
        servername: config.hostname,
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      });
      session.close();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(socket.listenerCount('data')).toEqual(0);
      expect(socket.listenerCount('secureConnect')).toEqual(0);
      expect(vi.getTimerCount()).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.open rejects an unauthorized TLS socket
     * @dependencies TLS connect mocked; no request is permitted.
     * @scenario Change only certificate authorization to false.
     * @expected Connection rejection before any RPC, followed by cleanup.
     */
    it('rejects an unauthorized TLS socket', async () => {
      socket.authorized = false;
      await expect(BitcoinCashElectrumSession.open(config)).rejects.toThrow('certificate rejected');
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.open bounds the TLS connection deadline
     * @dependencies TLS connect mocked and fake timers.
     * @scenario The connection never emits secureConnect.
     * @expected The finite connection deadline rejects and destroys the socket.
     */
    it('bounds the TLS connection deadline', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mocked.connect.mockImplementation(() => socket);
      const opening = BitcoinCashElectrumSession.open(config);
      const assertion = expect(opening).rejects.toThrow('connection timed out');
      await vi.advanceTimersByTimeAsync(ELECTRUM_LIMITS.connectMs);
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.open rejects overdue TLS readiness before its timer dispatches
     * @dependencies TLS mocked and Date advanced without dispatching timeout callbacks.
     * @scenario A verified secureConnect event arrives after the5s connection limit.
     * @expected Its absolute deadline rejects readiness before any RPC can be sent.
     */
    it('rejects overdue TLS readiness before its timer dispatches', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      mocked.connect.mockImplementation(() => socket);
      const opening = BitcoinCashElectrumSession.open(config);
      const assertion = expect(opening).rejects.toThrow('connection timed out');
      vi.setSystemTime(Date.now() + ELECTRUM_LIMITS.connectMs + 1);
      socket.emit('secureConnect');
      await assertion;
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.open rejects malformed server configuration %#
     * @dependencies TLS connect mocked.
     * @scenario Supply one invalid endpoint or deadline field.
     * @expected Configuration rejection without constructing a TLS socket.
     */
    it.each([
      { hostname: 'https://indexer.example' },
      { hostname: '' },
      { port: 0 },
      { port: 65536 },
      { timeoutMs: 0 },
      { timeoutMs: 30_001 },
    ])('rejects malformed server configuration %#', async (change) => {
      await expect(BitcoinCashElectrumSession.open({ ...config, ...change })).rejects.toThrow(
        'configuration',
      );
      expect(mocked.connect).not.toHaveBeenCalled();
    });
  });

  describe('request', () => {
    /**
     * @target BitcoinCashElectrumSession.request checks the enclosing deadline at the final frame write boundary
     * @dependencies actual JSON serialization and Date-only expiry without timer dispatch
     * @scenario the enclosing deadline expires while a frame is serialized
     * @expected the final synchronous deadline check prevents every socket write
     */
    it('checks the enclosing deadline at the final frame write boundary', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(1000);
      const session = await BitcoinCashElectrumSession.open(config, undefined, 1100);
      const parameter = {
        toJSON: () => {
          vi.setSystemTime(1100);
          return 'late';
        },
      };
      await expect(session.request('server.version', [parameter])).rejects.toThrow('timed out');
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
    /**
     * @target BitcoinCashElectrumSession.request cancels a pending read and removes its abort listener
     * @dependencies native cancellation, mocked TLS and fake timers
     * @scenario cancel the sole pending read and then deliver a late response
     * @expected the read rejects, late data is ignored and resources are released once
     */
    it('cancels a pending read and removes its abort listener', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const controller = new AbortController();
      const removal = vi.spyOn(controller.signal, 'removeEventListener');
      const session = await BitcoinCashElectrumSession.open(config, controller.signal);
      const pending = session.request('server.version', []);
      const rejection = expect(pending).rejects.toThrow('BCH Electrum operation cancelled');
      controller.abort('private reason');
      socket.emit('data', reply(1, 'late'));
      await rejection;
      expect(socket.write).toHaveBeenCalledOnce();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(removal).toHaveBeenCalledWith('abort', expect.any(Function));
      expect(vi.getTimerCount()).toEqual(0);
      expect(() => session.checkDeadline()).toThrow('cancelled');
    });

    /**
     * @target BitcoinCashElectrumSession.request rechecks cancellation immediately before writing a frame
     * @dependencies native cancellation and real frame serialization
     * @scenario a parameter getter cancels while JSON serialization runs
     * @expected the final pre-write check prevents any socket emission
     */
    it('rechecks cancellation immediately before writing a frame', async () => {
      const controller = new AbortController();
      const session = await BitcoinCashElectrumSession.open(config, controller.signal);
      const params = [
        {
          /** Cancel during serialization to isolate the final emission boundary. */
          get value() {
            controller.abort();
            return 'fixture';
          },
        },
      ];
      await expect(session.request('server.version', params)).rejects.toThrow('cancelled');
      expect(socket.write).not.toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects cancellation during response decoding
     * @dependencies real JSON decoder and native cancellation
     * @scenario cancel after JSON parsing succeeds but before the response is accepted
     * @expected the parsed response cannot resolve the cancelled request
     */
    it('rejects cancellation during response decoding', async () => {
      const controller = new AbortController();
      const session = await BitcoinCashElectrumSession.open(config, controller.signal);
      const pending = session.request('server.version', []);
      const rejection = expect(pending).rejects.toThrow('cancelled');
      const decode = JSON.parse;
      const parser = vi.spyOn(JSON, 'parse').mockImplementationOnce((text) => {
        const result = decode(text);
        controller.abort();
        return result;
      });
      try {
        socket.emit('data', reply(1, 'decoded'));
      } finally {
        parser.mockRestore();
      }
      await rejection;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });
    /**
     * @target BitcoinCashElectrumSession.request accepts a matching response split across bounded frames
     * @dependencies TLS socket mocked; real JSON framing and parser.
     * @scenario Deliver one matching response across two data events.
     * @expected Complete result, exact JSON-RPC request and newline framing.
     */
    it('accepts a matching response split across bounded frames', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const bytes = reply(1, { height: 661648, hex: '00'.repeat(80) });
      socket.emit('data', bytes.subarray(0, 20));
      socket.emit('data', bytes.subarray(20));
      await expect(result).resolves.toEqual({ height: 661648, hex: '00'.repeat(80) });
      expect(socket.write).toHaveBeenCalledWith(
        '{"jsonrpc":"2.0","id":1,"method":"blockchain.headers.get_tip","params":[]}\n',
      );
      session.close();
    });

    /**
     * @target BitcoinCashElectrumSession.request accepts a bounded reply fragmented into single-byte chunks
     * @dependencies TLS mocked; real linear framing over100k single-byte chunks.
     * @scenario A valid reply arrives in extreme fragmentation within its deadline.
     * @expected Exact result, bounded storage and cleanup without prefix recopying.
     */
    it('accepts a bounded reply fragmented into single-byte chunks', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request(
        'blockchain.transaction.get',
        ['12'.repeat(32), false],
        ELECTRUM_LIMITS.frameBytes,
      );
      const content = '0'.repeat(100_000);
      const bytes = reply(1, content);
      for (let index = 0; index < bytes.length; index++)
        socket.emit('data', bytes.subarray(index, index + 1));
      await expect(result).resolves.toEqual(content);
      session.close();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request enforces the absolute operation deadline during a fragment burst
     * @dependencies TLS mocked and deterministic Date expiry without timer dispatch.
     * @scenario A single-byte fragment burst crosses the100ms operation deadline.
     * @expected A data-event deadline guard stops work and destroys the socket.
     */
    it('enforces the absolute operation deadline during a fragment burst', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const session = await BitcoinCashElectrumSession.open({ ...config, timeoutMs: 100 });
      const result = session.request(
        'blockchain.transaction.get',
        ['12'.repeat(32), false],
        ELECTRUM_LIMITS.frameBytes,
      );
      const assertion = expect(result).rejects.toThrow('operation timed out');
      const start = Date.now();
      const bytes = reply(1, '0'.repeat(100_000));
      for (let index = 0; index < bytes.length; index++) {
        vi.setSystemTime(start + index);
        socket.emit('data', bytes.subarray(index, index + 1));
        if (socket.destroy.mock.calls.length) break;
      }
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(socket.listenerCount('data')).toEqual(0);
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects a late reply even if the request timer has not run
     * @dependencies TLS mocked and Date advanced without dispatching timer callbacks.
     * @scenario A matching response arrives after10s but before the30s operation cap.
     * @expected The absolute per-request deadline rejects it before parsing/resolution.
     */
    it('rejects a late reply even if the request timer has not run', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow('request timed out');
      vi.setSystemTime(Date.now() + ELECTRUM_LIMITS.requestMs + 1);
      socket.emit('data', reply(1, 1));
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request permits only one outstanding request
     * @dependencies TLS socket mocked; no response to the first call.
     * @scenario Attempt a second read while the first remains outstanding.
     * @expected The second call cannot overwrite the first request identity.
     */
    it('permits only one outstanding request', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const first = session.request('blockchain.headers.get_tip', []);
      await expect(session.request('blockchain.headers.get_tip', [])).rejects.toThrow(
        'session request',
      );
      socket.emit('data', reply(1, 7));
      await expect(first).resolves.toEqual(7);
      session.close();
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects mutation methods at runtime
     * @dependencies TLS socket mocked; runtime method type deliberately bypassed.
     * @scenario Attempt a broadcast through the read-only transport.
     * @expected No write occurs and the allowlist rejects the method.
     */
    it('rejects mutation methods at runtime', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      await expect(
        session.request('blockchain.transaction.broadcast' as 'blockchain.transaction.get', ['00']),
      ).rejects.toThrow('session request');
      expect(socket.write).not.toHaveBeenCalled();
      session.close();
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects malformed response identity %#
     * @dependencies TLS socket mocked; real envelope validation.
     * @scenario Change one response identity or result/error invariant.
     * @expected The pending call fails closed and its socket is destroyed.
     */
    it.each([
      { jsonrpc: '2.0', id: 2, result: 1 },
      { jsonrpc: '2.0', id: '1', result: 1 },
      { jsonrpc: '1.0', id: 1, result: 1 },
      { jsonrpc: '2.0', id: 1 },
      { jsonrpc: '2.0', id: 1, result: 1, error: {} },
      [{ jsonrpc: '2.0', id: 1, result: 1 }],
    ])('rejects malformed response identity %#', async (response) => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow('response identity');
      socket.emit('data', Buffer.from(`${JSON.stringify(response)}\n`));
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request does not expose remote error messages
     * @dependencies TLS socket mocked; remote error contains a secret marker.
     * @scenario Deliver a well-formed RPC error.
     * @expected Only a fixed error is exposed, and source text never escapes.
     */
    it('does not expose remote error messages', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow(/^BCH Electrum request rejected$/);
      socket.emit(
        'data',
        Buffer.from('{"jsonrpc":"2.0","id":1,"error":{"message":"credential-marker"}}\n'),
      );
      await assertion;
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects malformed frame %#
     * @dependencies TLS socket mocked; real byte accounting and fatal UTF8 decode.
     * @scenario Supply malformed JSON, UTF8, or a second frame in one response.
     * @expected Parsing/framing rejection with cleanup.
     */
    it.each([
      Buffer.from('not-json\n'),
      Buffer.from([0x7b, 0x22, 0xff, 0x22, 0x3a, 0x31, 0x7d, 0x0a]),
      Buffer.concat([reply(1, 1), reply(1, 1)]),
    ])('rejects malformed frame %#', async (bytes) => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow(/JSON response|response framing/);
      socket.emit('data', bytes);
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request bounds incomplete frames before concatenation
     * @dependencies TLS socket mocked and a small per-response limit.
     * @scenario An unterminated reply crosses the allowed byte count in chunks.
     * @expected Rejection before an oversized frame can be concatenated or parsed.
     */
    it('bounds incomplete frames before concatenation', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', [], 40);
      const assertion = expect(result).rejects.toThrow('byte limit');
      socket.emit('data', Buffer.alloc(30, 0x20));
      socket.emit('data', Buffer.alloc(11, 0x20));
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request accepts the exact frame byte boundary
     * @dependencies TLS mocked; exact framed response length.
     * @scenario Return a valid frame exactly at its maximum before the newline.
     * @expected The delimiter does not incorrectly consume the payload allowance.
     */
    it('accepts the exact frame byte boundary', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const bytes = reply(1, 1);
      const result = session.request('blockchain.headers.get_tip', [], bytes.length - 1);
      socket.emit('data', bytes);
      await expect(result).resolves.toEqual(1);
      session.close();
    });

    /**
     * @target BitcoinCashElectrumSession.request bounds aggregate bytes across successful requests
     * @dependencies TLS socket mocked; two individually allowed large replies.
     * @scenario The aggregate operation bytes exceed their independent limit.
     * @expected The second reply fails despite satisfying its per-frame limit.
     */
    it('bounds aggregate bytes across successful requests', async () => {
      const session = await BitcoinCashElectrumSession.open(config);
      const first = session.request(
        'blockchain.transaction.get',
        ['12'.repeat(32), false],
        ELECTRUM_LIMITS.frameBytes,
      );
      socket.emit('data', reply(1, '0'.repeat(2_000_000)));
      await first;
      const second = session.request(
        'blockchain.transaction.get',
        ['34'.repeat(32), false],
        ELECTRUM_LIMITS.frameBytes,
      );
      const assertion = expect(second).rejects.toThrow('byte limit');
      socket.emit('data', reply(2, '0'.repeat(2_000_000)));
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request times out a pending read and cleans up
     * @dependencies TLS socket mocked and fake timers.
     * @scenario A request receives no reply.
     * @expected Its finite deadline rejects and clears every timer.
     */
    it('times out a pending read and cleans up', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow('request timed out');
      await vi.advanceTimersByTimeAsync(ELECTRUM_LIMITS.requestMs);
      await assertion;
      expect(vi.getTimerCount()).toEqual(0);
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.request rejects transport %s during a read
     * @dependencies TLS socket mocked.
     * @scenario The server closes or emits an error during an outstanding read.
     * @expected Rejection contains only a fixed error and resources are released.
     */
    it.each(['close', 'error'])('rejects transport %s during a read', async (event) => {
      const session = await BitcoinCashElectrumSession.open(config);
      const result = session.request('blockchain.headers.get_tip', []);
      const assertion = expect(result).rejects.toThrow(/connection closed|connection failed/);
      socket.emit(event, new Error('private endpoint marker'));
      await assertion;
      expect(socket.destroy).toHaveBeenCalledOnce();
    });
  });

  describe('openForSubmission', () => {
    /**
     * @target BitcoinCashElectrumSession.openForSubmission rejects an expired enclosing submission budget
     * @dependencies actual clock moved without dispatching timers and mocked TLS
     * @scenario an enclosing request budget expired during the preceding quote
     * @expected no submission socket is acquired
     */
    it('rejects an expired enclosing submission budget', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1200);
      await expect(
        BitcoinCashElectrumSession.openForSubmission(config, undefined, 1100),
      ).rejects.toThrow('timed out');
      expect(mocked.connect).not.toHaveBeenCalled();
    });
  });

  describe('checkDeadline', () => {
    /**
     * @target BitcoinCashElectrumSession.checkDeadline checks an absolute deadline even before its timer executes
     * @dependencies TLS socket mocked and the wall-clock moved synchronously.
     * @scenario Parsing delays timer execution beyond the absolute operation deadline.
     * @expected An overdue operation cannot return a result or start another read.
     */
    it('checks an absolute deadline even before its timer executes', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const session = await BitcoinCashElectrumSession.open({ ...config, timeoutMs: 100 });
      vi.setSystemTime(Date.now() + 101);
      expect(() => session.checkDeadline()).toThrow('session expired');
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
  });

  describe('broadcastValidated', () => {
    /**
     * @target BitcoinCashElectrumSession.broadcastValidated keeps cancellation after emission ambiguous without retrying
     * @dependencies native cancellation and real signed bytes on a mocked socket
     * @scenario cancel after the single broadcast write while its reply is pending
     * @expected an ambiguous outcome is reported and no second write is possible
     */
    it('keeps cancellation after emission ambiguous without retrying', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const controller = new AbortController();
      const signed = signIntent(signingIntent());
      const session = await BitcoinCashElectrumSession.openForSubmission(config, controller.signal);
      const pending = session.broadcastValidated(signed, hash(signed));
      const rejection = expect(pending).rejects.toThrow('outcome is unknown or rejected');
      controller.abort();
      await rejection;
      await expect(session.broadcastValidated(signed, hash(signed))).rejects.toThrow('cancelled');
      expect(socket.write).toHaveBeenCalledOnce();
      expect(socket.destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
    /**
     * @target BitcoinCashElectrumSession.broadcastValidated guards generic/read broadcast; submission=%s
     * @dependencies Explicit modes, TLS mocked and real builder/signature fixture.
     * @scenario Attempt broadcast on a read session or through generic request in either mode.
     * @expected Every generic/read mutation attempt fails without a socket write.
     */
    it.each([false, true])('guards generic/read broadcast; submission=%s', async (submission) => {
      const signed = signIntent(signingIntent());
      const session = await (submission
        ? BitcoinCashElectrumSession.openForSubmission(config)
        : BitcoinCashElectrumSession.open(config));
      await expect(
        session.request('blockchain.transaction.broadcast' as never, [signed]),
      ).rejects.toThrow('session request');
      if (!submission)
        await expect(session.broadcastValidated(signed, hash(signed))).rejects.toThrow(
          'submission capability',
        );
      expect(socket.write).not.toHaveBeenCalled();
      session.close();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.broadcastValidated consumes the capability exactly once
     * @dependencies Explicit submission socket, real signed bytes and exact native hash.
     * @scenario Broadcast succeeds, then the same capability is invoked again.
     * @expected The second invocation fails before writing a second request.
     */
    it('consumes the capability exactly once', async () => {
      const signed = signIntent(signingIntent());
      const session = await BitcoinCashElectrumSession.openForSubmission(config);
      const result = session.broadcastValidated(signed, hash(signed));
      socket.emit('data', reply(1, hash(signed)));
      await expect(result).resolves.toEqual(hash(signed));
      await expect(session.broadcastValidated(signed, hash(signed))).rejects.toThrow(
        'submission capability',
      );
      expect(socket.write).toHaveBeenCalledOnce();
      expect(socket.write).toHaveBeenCalledWith(
        `${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'blockchain.transaction.broadcast', params: [signed] })}\n`,
      );
      session.close();
      expect(socket.destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target BitcoinCashElectrumSession.broadcastValidated rejects unvalidated bytes %s
     * @dependencies Explicit submission socket, real signed fixture and bounded hex/hash checks.
     * @scenario Change only local hash or provide malformed/oversized signed bytes.
     * @expected Identity and frame failures occur before any mutation request.
     */
    it.each(['wrongHash', 'empty', 'uppercase', 'oversized'])(
      'rejects unvalidated bytes %s',
      async (mutation) => {
        const signed = signIntent(signingIntent());
        const session = await BitcoinCashElectrumSession.openForSubmission(config);
        const bytes =
          mutation === 'empty'
            ? ''
            : mutation === 'uppercase'
              ? signed.toUpperCase()
              : mutation === 'oversized'
                ? '00'.repeat(100001)
                : signed;
        await expect(
          session.broadcastValidated(
            bytes,
            mutation === 'wrongHash' ? '00'.repeat(32) : hash(signed),
          ),
        ).rejects.toThrow();
        expect(socket.write).not.toHaveBeenCalled();
        session.close();
      },
    );
  });
});
