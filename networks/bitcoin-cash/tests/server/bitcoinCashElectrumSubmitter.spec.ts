import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

import { binToHex, decodeTransactionBCH, encodeTransactionBCH, hexToBin } from '@bitauth/libauth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type BitcoinCashUnsignedLock,
  generateBitcoinCashUnsignedLock,
} from '../../src/generateUnsignedTx';
import type { BitcoinCashLockMetadata } from '../../src/metadata';
import {
  type BitcoinCashSubmissionPolicy,
  createBitcoinCashElectrumSubmitter,
} from '../../src/server/bitcoinCashElectrumSubmitter';
import { BitcoinCashElectrumSession } from '../../src/server/electrumSession';
import { signIntent, signingIntent } from '../testUtils';
import { axionHeader } from './axionHeaderTestData';

const mocked = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock('node:tls', () => ({ connect: mocked.connect }));
const noReply = Symbol('No offline reply');

interface Request {
  id: number;
  method: string;
  params: unknown[];
}
interface Row {
  tx_hash: string;
  tx_pos: number;
  height: number;
  value: number;
}

/** Simulates one verified TLS socket, never a real connection or node mutation. */
class MockSocket extends EventEmitter {
  authorized = true;
  /** Records teardown without changing the offline response fixture. */
  destroy = vi.fn(() => this);
  /** Dispatches one recorded JSON-RPC request through the offline handler. */
  write = vi.fn((data: string) => {
    const request = JSON.parse(data) as Request;
    requests.push(request);
    const result = handler(request);
    if (result !== noReply)
      queueMicrotask(() =>
        this.emit(
          'data',
          Buffer.from(`${JSON.stringify({ jsonrpc: '2.0', id: request.id, result })}\n`),
        ),
      );
    return true;
  });
}

/** Explicit TLS Electrum endpoint whose requests are handled by offline mocks. */
const options = { hostname: 'bch-indexer.example', port: 50002 };
/** Ethereum destination and exact Rosen fees committed by the signed fixture. */
const metadata: BitcoinCashLockMetadata = {
  toChain: 'ethereum',
  toAddress: `0x${'12'.repeat(20)}`,
  bridgeFee: 100n,
  networkFee: 100n,
};
let intent: BitcoinCashUnsignedLock;
let signed: string;
let rows: Row[];
let parents: Map<string, string>;
let requests: Request[];
let sockets: MockSocket[];
let handler: (request: Request) => unknown;

/** Computes the signed byte identity independently with native double-SHA256. */
const hash = (hex: string): string => {
  const first = createHash('sha256').update(Buffer.from(hex, 'hex')).digest();
  return createHash('sha256').update(first).digest().reverse().toString('hex');
};

/** Uses the real frozen builder intent to prepare a later confirmed source snapshot. */
const configureIntent = (next: BitcoinCashUnsignedLock): void => {
  intent = next;
  signed = signIntent(next);
  parents = new Map(next.selectedUtxos.map((utxo) => [utxo.txId, utxo.parentTransactionHex]));
  rows = next.selectedUtxos.map((utxo) => ({
    tx_hash: utxo.txId,
    tx_pos: utxo.index,
    height: utxo.height,
    value: Number(utxo.value),
  }));
};

/** Produces canonical server policy independent of the incoming wallet request. */
const policy = (): BitcoinCashSubmissionPolicy => ({
  lockAddress: signingIntent().lockAddress,
  feeRate: 2,
  maxFee: 10000n,
  allowedDestinationChains: ['ethereum'],
});

/** Serves offline chain identity, stable native snapshot and matching broadcast result. */
const baseHandler = (request: Request): unknown => {
  switch (request.method) {
    case 'server.version':
      return ['Fulcrum offline fixture', '1.5'];
    case 'blockchain.block.header':
      return axionHeader;
    case 'blockchain.headers.get_tip':
      return { height: 700002, hex: '01'.repeat(80) };
    case 'blockchain.scripthash.listunspent':
      return rows;
    case 'blockchain.transaction.get':
      return parents.get(request.params[0] as string);
    case 'blockchain.transaction.broadcast':
      return hash(request.params[0] as string);
    default:
      throw new Error('Unexpected offline method');
  }
};

/** Returns exactly the emitted mutation methods for one-call assertions. */
const broadcasts = (): Request[] =>
  requests.filter(({ method }) => method === 'blockchain.transaction.broadcast');

beforeEach(() => {
  configureIntent(signingIntent());
  requests = [];
  sockets = [];
  handler = baseHandler;
  mocked.connect.mockReset().mockImplementation(() => {
    const socket = new MockSocket();
    sockets.push(socket);
    queueMicrotask(() => socket.emit('secureConnect'));
    return socket;
  });
});
afterEach(() => vi.useRealTimers());

describe('createBitcoinCashElectrumSubmitter', () => {
  describe('policy', () => {
    /**
     * @target createBitcoinCashElectrumSubmitter rejects invalid policy %s
     * @dependencies Real canonical CashAddr/registry validation; TLS mocked.
     * @scenario Independently alter treasury spelling, fee rate, max fee or assigned route list.
     * @expected Each invalid server policy fails before acquiring any socket.
     */
    it.each([
      'uppercase',
      'prefixless',
      'fractionalRate',
      'zeroRate',
      'unsafeRate',
      'zeroMax',
      'numberMax',
      'hugeMax',
      'emptyRoutes',
      'duplicateRoutes',
      'alias',
      'unassigned',
      'unknown',
    ])('rejects invalid policy %s', (mutation) => {
      const next = policy();
      if (mutation === 'uppercase') next.lockAddress = next.lockAddress.toUpperCase();
      if (mutation === 'prefixless') next.lockAddress = next.lockAddress.split(':')[1];
      if (mutation === 'fractionalRate') next.feeRate = 1.5;
      if (mutation === 'zeroRate') next.feeRate = 0;
      if (mutation === 'unsafeRate') next.feeRate = Number.MAX_SAFE_INTEGER + 1;
      if (mutation === 'zeroMax') next.maxFee = 0n;
      if (mutation === 'numberMax') next.maxFee = 1000 as unknown as bigint;
      if (mutation === 'hugeMax') next.maxFee = 2_100_000_000_000_001n;
      if (mutation === 'emptyRoutes') next.allowedDestinationChains = [];
      if (mutation === 'duplicateRoutes') next.allowedDestinationChains = ['ethereum', 'ethereum'];
      if (mutation === 'alias') next.allowedDestinationChains = ['Ethereum'];
      if (mutation === 'unassigned') next.allowedDestinationChains = ['bitcoin-cash'];
      if (mutation === 'unknown') next.allowedDestinationChains = ['unknown'];
      expect(() => createBitcoinCashElectrumSubmitter(options, next)).toThrow(
        'server submission policy',
      );
      expect(mocked.connect).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    /**
     * @target submit copies server policy before callers can mutate it
     * @dependencies Cloned real operator policy and offline valid signed intent.
     * @scenario Mutate original policy fields and its route array after factory creation.
     * @expected The original copied treasury/fee/routes continue governing submission.
     */
    it('copies server policy before callers can mutate it', async () => {
      const supplied = policy();
      const routes = ['ethereum'];
      supplied.allowedDestinationChains = routes;
      const submitter = createBitcoinCashElectrumSubmitter(options, supplied);
      supplied.lockAddress = intent.fromAddress;
      supplied.feeRate = 1;
      supplied.maxFee = 1n;
      routes[0] = 'bitcoin';
      await expect(submitter.submit(signed, intent, metadata)).resolves.toEqual(hash(signed));
      expect(broadcasts()).toHaveLength(1);
    });
    /**
     * @target submit rejects an expired trusted deadline before authorization
     * @dependencies real signed intent and Date-only enclosing expiry
     * @scenario an earlier quote exhausted the enclosing request budget
     * @expected submission rejects without socket acquisition or broadcast
     */
    it('rejects an expired trusted deadline before authorization', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1200);
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          intent,
          metadata,
          undefined,
          1100,
        ),
      ).rejects.toThrow('deadline expired');
      expect(mocked.connect).not.toHaveBeenCalled();
      expect(broadcasts()).toHaveLength(0);
    });

    /**
     * @target submit preserves the trusted deadline through authorization
     * @dependencies intent snapshot getter and real signed authorization
     * @scenario the enclosing deadline expires during synchronous authorization
     * @expected the session acquisition check rejects before TLS and broadcast
     */
    it('preserves the trusted deadline through authorization', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1000);
      const supplied = { ...intent };
      Object.defineProperty(supplied, 'fromAddress', {
        get: () => {
          vi.setSystemTime(1100);
          return intent.fromAddress;
        },
      });
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          supplied,
          metadata,
          undefined,
          1100,
        ),
      ).rejects.toThrow('timed out');
      expect(mocked.connect).not.toHaveBeenCalled();
      expect(broadcasts()).toHaveLength(0);
    });

    /**
     * @target submit keeps the enclosing deadline through final UTXO authentication
     * @dependencies actual authenticated UTXO reads and Date-only deadline expiry
     * @scenario the enclosing deadline expires during the final source snapshot
     * @expected the original deadline reaches the session and prevents broadcast
     */
    it('keeps the enclosing deadline through final UTXO authentication', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(1000);
      let lists = 0;
      handler = (request) => {
        const result = baseHandler(request);
        if (request.method === 'blockchain.scripthash.listunspent' && ++lists === 2)
          vi.setSystemTime(1100);
        return result;
      };
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          intent,
          metadata,
          undefined,
          1100,
        ),
      ).rejects.toThrow('timed out');
      expect(broadcasts()).toHaveLength(0);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
      expect(vi.getTimerCount()).toEqual(0);
    });
    /**
     * @target submit rejects cancellation before acquiring a submission socket
     * @dependencies real signed intent and native cancellation; TLS mocked
     * @scenario cancel before submission authorization starts
     * @expected no connection or broadcast is attempted
     */
    it('rejects cancellation before acquiring a submission socket', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          intent,
          metadata,
          controller.signal,
        ),
      ).rejects.toThrow('BCH submission cancelled');
      expect(mocked.connect).not.toHaveBeenCalled();
      expect(broadcasts()).toHaveLength(0);
    });

    /**
     * @target submit cancels before broadcast during%s
     * @dependencies real authorization and native cancellation on an offline TLS socket
     * @scenario cancel during authentication or the final unspent snapshot read
     * @expected pending work rejects, the socket closes and no broadcast is emitted
     */
    it.each(['authentication', 'finalSnapshot'])(
      'cancels before broadcast during%s',
      async (stage) => {
        const controller = new AbortController();
        let lists = 0;
        handler = (request) => {
          if (request.method === 'blockchain.scripthash.listunspent') lists++;
          if (
            (stage === 'authentication' && request.method === 'server.version') ||
            (stage === 'finalSnapshot' &&
              request.method === 'blockchain.scripthash.listunspent' &&
              lists === 2)
          ) {
            controller.abort();
            return noReply;
          }
          return baseHandler(request);
        };
        await expect(
          createBitcoinCashElectrumSubmitter(options, policy()).submit(
            signed,
            intent,
            metadata,
            controller.signal,
          ),
        ).rejects.toThrow('cancelled');
        expect(broadcasts()).toHaveLength(0);
        expect(sockets[0].destroy).toHaveBeenCalledOnce();
      },
    );

    /**
     * @target submit forwards cancellation to the final session emission boundary
     * @dependencies real session and validator with an intercepted emission boundary
     * @scenario cancel after the fresh snapshot when broadcastValidated is entered
     * @expected the underlying session prevents the broadcast write
     */
    it('forwards cancellation to the final session emission boundary', async () => {
      const controller = new AbortController();
      const open = BitcoinCashElectrumSession.openForSubmission;
      const opening = vi
        .spyOn(BitcoinCashElectrumSession, 'openForSubmission')
        .mockImplementation(async (endpoint, signal) => {
          const session = await open(endpoint, signal);
          const broadcast = session.broadcastValidated;
          session.broadcastValidated = async (hex, id) => {
            controller.abort();
            return broadcast(hex, id);
          };
          return session;
        });
      try {
        await expect(
          createBitcoinCashElectrumSubmitter(options, policy()).submit(
            signed,
            intent,
            metadata,
            controller.signal,
          ),
        ).rejects.toThrow('cancelled');
        expect(broadcasts()).toHaveLength(0);
        expect(sockets[0].destroy).toHaveBeenCalledOnce();
      } finally {
        opening.mockRestore();
      }
    });

    /**
     * @target submit does not retry when cancellation follows the broadcast write
     * @dependencies real authorization and one offline broadcast write
     * @scenario caller cancellation arrives after the mutation request is emitted
     * @expected ambiguous failure, one write and no reconnection or retry
     */
    it('does not retry when cancellation follows the broadcast write', async () => {
      const controller = new AbortController();
      handler = (request) => {
        if (request.method === 'blockchain.transaction.broadcast') {
          controller.abort();
          return noReply;
        }
        return baseHandler(request);
      };
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          intent,
          metadata,
          controller.signal,
        ),
      ).rejects.toThrow('outcome is unknown or rejected');
      expect(broadcasts()).toHaveLength(1);
      expect(mocked.connect).toHaveBeenCalledOnce();
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });
    /**
     * @target submit authenticates and broadcasts once; multiple=%s
     * @dependencies Real builder, Schnorr signatures, raw parents and offline BCH header.
     * @scenario Fresh confirmations advance; all inputs remain eligible in one stable snapshot.
     * @expected Exact local transaction ID after one broadcast on the same socket, then cleanup.
     */
    it.each([false, true])('authenticates and broadcasts once; multiple=%s', async (multiple) => {
      configureIntent(signingIntent(multiple));
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(signed, intent, metadata),
      ).resolves.toEqual(hash(signed));
      expect(mocked.connect).toHaveBeenCalledOnce();
      expect(broadcasts()).toEqual([
        {
          jsonrpc: '2.0',
          id: requests.length,
          method: 'blockchain.transaction.broadcast',
          params: [signed],
        },
      ]);
      expect(requests[0].method).toEqual('server.version');
      expect(requests[1].method).toEqual('blockchain.block.header');
      expect(requests.at(-2)?.method).toEqual('blockchain.headers.get_tip');
      expect(
        requests.filter(({ method }) => method === 'blockchain.scripthash.listunspent'),
      ).toHaveLength(2);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
      expect(sockets[0].listenerCount('data')).toEqual(0);
      expect(sockets[0].listenerCount('close')).toEqual(0);
    });

    /**
     * @target submit rejects unauthorized %s before TLS
     * @dependencies Valid signed bytes, separately configured policy and trusted metadata.
     * @scenario Change only treasury, fee rate, maximum fee, allowed route, destination or Rosen fee.
     * @expected A valid signature never authorizes altered server policy or metadata; no TLS.
     */
    it.each(['treasury', 'feeRate', 'maxFee', 'route', 'destination', 'bridgeFee', 'networkFee'])(
      'rejects unauthorized %s before TLS',
      async (mutation) => {
        const nextPolicy = policy();
        const expected = { ...metadata };
        if (mutation === 'treasury') nextPolicy.lockAddress = intent.fromAddress;
        if (mutation === 'feeRate') nextPolicy.feeRate = 3;
        if (mutation === 'maxFee') nextPolicy.maxFee = intent.fee - 1n;
        if (mutation === 'route') nextPolicy.allowedDestinationChains = ['bitcoin'];
        if (mutation === 'destination') expected.toAddress = `0x${'13'.repeat(20)}`;
        if (mutation === 'bridgeFee') expected.bridgeFee += 1n;
        if (mutation === 'networkFee') expected.networkFee += 1n;
        await expect(
          createBitcoinCashElectrumSubmitter(options, nextPolicy).submit(signed, intent, expected),
        ).rejects.toThrow('authorization or signed transaction');
        expect(mocked.connect).not.toHaveBeenCalled();
      },
    );

    /**
     * @target submit rejects signed mutation %s
     * @dependencies Genuine signature fixture with one altered unsigned body field.
     * @scenario Change version, locktime, outpoint, sequence, treasury, change or metadata bytes.
     * @expected The shared validator rejects every body mutation before TLS/broadcast.
     */
    it.each([
      'version',
      'locktime',
      'outpoint',
      'sequence',
      'amount',
      'change',
      'metadata',
      'signature',
    ])('rejects signed mutation %s', async (mutation) => {
      const changed = decodeTransactionBCH(hexToBin(signed));
      if (typeof changed === 'string') throw new Error(changed);
      if (mutation === 'version') changed.version = 1;
      if (mutation === 'locktime') changed.locktime = 1;
      if (mutation === 'outpoint') changed.inputs[0].outpointIndex = 1;
      if (mutation === 'sequence') changed.inputs[0].sequenceNumber = 1;
      if (mutation === 'amount') changed.outputs[0].valueSatoshis += 1n;
      if (mutation === 'change') changed.outputs[2].valueSatoshis -= 1n;
      if (mutation === 'metadata') changed.outputs[1].lockingBytecode[3] ^= 1;
      if (mutation === 'signature') changed.inputs[0].unlockingBytecode[1] ^= 1;
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(
          binToHex(encodeTransactionBCH(changed)),
          intent,
          metadata,
        ),
      ).rejects.toThrow('authorization or signed transaction');
      expect(mocked.connect).not.toHaveBeenCalled();
    });

    /**
     * @target submit rejects forged intent %s
     * @dependencies Real immutable intent plus independently forged parent assertions.
     * @scenario Alter value, script, raw parent, coinbase or maturity in the submitted context.
     * @expected Reject forged prevouts before opening a session.
     */
    it.each(['value', 'script', 'parent', 'coinbase', 'maturity'])(
      'rejects forged intent %s',
      async (mutation) => {
        const copied = {
          ...intent,
          selectedUtxos: intent.selectedUtxos.map((utxo) => ({ ...utxo })),
        };
        if (mutation === 'value') copied.selectedUtxos[0].value += 1n;
        if (mutation === 'script')
          copied.selectedUtxos[0].scriptPubKey = `76a914${'44'.repeat(20)}88ac`;
        if (mutation === 'parent') copied.selectedUtxos[0].parentTransactionHex += '00';
        if (mutation === 'coinbase') copied.selectedUtxos[0].coinbase = true;
        if (mutation === 'maturity') copied.selectedUtxos[0].confirmations = 0;
        await expect(
          createBitcoinCashElectrumSubmitter(options, policy()).submit(signed, copied, metadata),
        ).rejects.toThrow('authorization or signed transaction');
        expect(mocked.connect).not.toHaveBeenCalled();
      },
    );

    /**
     * @target submit rejects current snapshot %s
     * @dependencies Real valid signed intent and single changed current-indexer assertion.
     * @scenario Supply foreign checkpoint, missing/spent outpoint, unconfirmed/future row or forged raw/value.
     * @expected Fresh authentication fails and closes once, with zero broadcast calls.
     */
    it.each(['foreignChain', 'spent', 'unconfirmed', 'future', 'value', 'rawParent'])(
      'rejects current snapshot %s',
      async (mutation) => {
        if (mutation === 'spent') rows = [];
        if (mutation === 'unconfirmed') rows[0].height = 0;
        if (mutation === 'future') rows[0].height = 700003;
        if (mutation === 'value') rows[0].value += 1;
        handler = (request) => {
          if (mutation === 'foreignChain' && request.method === 'blockchain.block.header')
            return `01${axionHeader.slice(2)}`;
          if (mutation === 'rawParent' && request.method === 'blockchain.transaction.get')
            return `${parents.values().next().value}00`;
          return baseHandler(request);
        };
        await expect(
          createBitcoinCashElectrumSubmitter(options, policy()).submit(signed, intent, metadata),
        ).rejects.toThrow();
        expect(broadcasts()).toHaveLength(0);
        expect(mocked.connect).toHaveBeenCalledOnce();
        expect(sockets[0].destroy).toHaveBeenCalledOnce();
      },
    );

    /**
     * @target submit rejects final snapshot drift %s
     * @dependencies Stable initial snapshot with one changed final relist or tip.
     * @scenario Remove an outpoint on relist or change tip height/header before broadcast.
     * @expected Drift aborts the operation without submitting or reconnecting.
     */
    it.each(['relist', 'height', 'header'])('rejects final snapshot drift %s', async (mutation) => {
      let lists = 0;
      let tips = 0;
      handler = (request) => {
        if (
          request.method === 'blockchain.scripthash.listunspent' &&
          ++lists === 2 &&
          mutation === 'relist'
        )
          return [];
        if (request.method === 'blockchain.headers.get_tip' && ++tips === 2) {
          if (mutation === 'height') return { height: 700003, hex: '01'.repeat(80) };
          if (mutation === 'header') return { height: 700002, hex: '02'.repeat(80) };
        }
        return baseHandler(request);
      };
      await expect(
        createBitcoinCashElectrumSubmitter(options, policy()).submit(signed, intent, metadata),
      ).rejects.toThrow('snapshot changed');
      expect(broadcasts()).toHaveLength(0);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target submit uses current coinbase maturity; immature=%s
     * @dependencies Synthetic coinbase parent and real builder/Schnorr verifier.
     * @scenario Initial signing maturity is100; fresh maturity is102 or falls to99.
     * @expected Fresh eligible coinbase succeeds despite advanced confirmations; immature fails.
     */
    it.each([false, true])('uses current coinbase maturity; immature=%s', async (immature) => {
      const parent = decodeTransactionBCH(hexToBin(intent.selectedUtxos[0].parentTransactionHex));
      if (typeof parent === 'string') throw new Error(parent);
      parent.inputs[0].outpointIndex = 0xffffffff;
      parent.inputs[0].outpointTransactionHash = new Uint8Array(32);
      parent.inputs[0].unlockingBytecode = Uint8Array.of(1, 1);
      const raw = binToHex(encodeTransactionBCH(parent));
      const coinbase = {
        ...intent.selectedUtxos[0],
        txId: hash(raw),
        parentTransactionHex: raw,
        coinbase: true,
        height: 699901,
        confirmations: 100,
      };
      configureIntent(
        generateBitcoinCashUnsignedLock({
          ...metadata,
          fromAddress: intent.fromAddress,
          lockAddress: intent.lockAddress,
          amount: intent.amount,
          feeRate: 2,
          maxFee: 10000n,
          utxos: [coinbase],
        }),
      );
      if (immature) rows[0].height = 699904;
      const result = createBitcoinCashElectrumSubmitter(options, policy()).submit(
        signed,
        intent,
        metadata,
      );
      if (immature) await expect(result).rejects.toThrow('no longer eligible');
      else await expect(result).resolves.toEqual(hash(signed));
      expect(broadcasts()).toHaveLength(immature ? 0 : 1);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target submit copies intent before the first await
     * @dependencies Mutable caller copy, real validator and asynchronous TLS handshake.
     * @scenario Caller alters source, selected prevout and signed bytes after submit begins.
     * @expected The copied validated intent and primitive bytes remain the submitted identity.
     */
    it('copies intent before the first await', async () => {
      const supplied = {
        ...intent,
        selectedUtxos: intent.selectedUtxos.map((utxo) => ({ ...utxo })),
      };
      const result = createBitcoinCashElectrumSubmitter(options, policy()).submit(
        signed,
        supplied,
        metadata,
      );
      supplied.fromAddress = intent.lockAddress;
      supplied.selectedUtxos[0].value += 1n;
      supplied.selectedUtxos[0].parentTransactionHex = '00';
      await expect(result).resolves.toEqual(hash(signed));
      expect(broadcasts()[0].params).toEqual([signed]);
    });

    /**
     * @target submit rejects broadcast result %s
     * @dependencies Valid signed transaction and one altered broadcast result.
     * @scenario Return another hash, uppercase identity, malformed type or object.
     * @expected Fixed ambiguous-outcome failure, one emission, one cleanup and no retries.
     */
    it.each(['wrongHash', 'uppercase', 'null', 'object'])(
      'rejects broadcast result %s',
      async (mutation) => {
        handler = (request) =>
          request.method === 'blockchain.transaction.broadcast'
            ? mutation === 'wrongHash'
              ? '00'.repeat(32)
              : mutation === 'uppercase'
                ? hash(signed).toUpperCase()
                : mutation === 'null'
                  ? null
                  : { txId: hash(signed) }
            : baseHandler(request);
        await expect(
          createBitcoinCashElectrumSubmitter(options, policy()).submit(signed, intent, metadata),
        ).rejects.toThrow('outcome is unknown or rejected');
        expect(broadcasts()).toHaveLength(1);
        expect(mocked.connect).toHaveBeenCalledOnce();
        expect(sockets[0].destroy).toHaveBeenCalledOnce();
      },
    );

    /**
     * @target submit does not retry ambiguous %s
     * @dependencies Offline socket and fake deadline/transport events after the one write.
     * @scenario Broadcast reply is lost, closes, fails, carries wrong RPC ID or remote error.
     * @expected Unknown/rejected outcome closes once, hides remote detail and never resubmits.
     */
    it.each(['timeout', 'close', 'error', 'wrongId', 'rpcError'])(
      'does not retry ambiguous %s',
      async (failure) => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        handler = (request) => {
          if (request.method !== 'blockchain.transaction.broadcast') return baseHandler(request);
          queueMicrotask(() => {
            const socket = sockets[0];
            if (failure === 'close') socket.emit('close');
            if (failure === 'error') socket.emit('error', new Error('private endpoint marker'));
            if (failure === 'wrongId')
              socket.emit(
                'data',
                Buffer.from(
                  `${JSON.stringify({ jsonrpc: '2.0', id: request.id + 1, result: hash(signed) })}\n`,
                ),
              );
            if (failure === 'rpcError')
              socket.emit(
                'data',
                Buffer.from(
                  `${JSON.stringify({ jsonrpc: '2.0', id: request.id, error: { code: -1, message: 'private endpoint marker' } })}\n`,
                ),
              );
          });
          return noReply;
        };
        const result = createBitcoinCashElectrumSubmitter(options, policy()).submit(
          signed,
          intent,
          metadata,
        );
        const assertion = expect(result).rejects.toThrow('outcome is unknown or rejected');
        await vi.advanceTimersByTimeAsync(10000);
        await assertion;
        expect(broadcasts()).toHaveLength(1);
        expect(mocked.connect).toHaveBeenCalledOnce();
        expect(sockets[0].destroy).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toEqual(0);
      },
    );
  });
});
