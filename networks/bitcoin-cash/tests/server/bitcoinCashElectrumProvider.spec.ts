import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

import {
  decodeTransactionBCH,
  encodeTransactionBCH,
  lockingBytecodeToCashAddress,
} from '@bitauth/libauth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BCH_AXION_CHECKPOINT,
  createBitcoinCashElectrumProvider,
} from '../../src/server/bitcoinCashElectrumProvider';
import { axionHeader } from './axionHeaderTestData';

const mocked = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock('node:tls', () => ({ connect: mocked.connect }));
vi.mock('@bitauth/libauth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bitauth/libauth')>();
  // Count real decoding calls without substituting interpretation of any bytes.
  return { ...actual, decodeTransactionBCH: vi.fn(actual.decodeTransactionBCH) };
});

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
  token_data?: unknown;
}

/** Simulates TLS events and newline replies without opening a real socket. */
class MockSocket extends EventEmitter {
  authorized = true;
  destroy = vi.fn(() => this);
  write = vi.fn((data: string) => {
    const request = JSON.parse(data) as Request;
    requests.push(request);
    const result = handler(request);
    queueMicrotask(() =>
      this.emit(
        'data',
        Buffer.from(`${JSON.stringify({ jsonrpc: '2.0', id: request.id, result })}\n`),
      ),
    );
    return true;
  });
}

const script = `76a914${'11'.repeat(20)}88ac`;
/** Creates a public test address for the selected source-script variant. */
const addressFor = (
  bytecode = script,
  prefix: 'bitcoincash' | 'bchtest' = 'bitcoincash',
  tokenSupport = false,
): string => {
  const result = lockingBytecodeToCashAddress({
    bytecode: Uint8Array.from(Buffer.from(bytecode, 'hex')),
    prefix,
    tokenSupport,
  });
  if (typeof result === 'string') throw new Error(result);
  return result.address;
};
const address = addressFor();
/** Computes expected test transaction identifiers using native double-SHA256. */
const hash = (hex: string): string => {
  const first = createHash('sha256').update(Buffer.from(hex, 'hex')).digest();
  return createHash('sha256').update(first).digest().reverse().toString('hex');
};

/** Encodes a canonical raw parent with one isolated script/token/coinbase variant. */
const parentHex = (
  value = 123456789n,
  bytecode = script,
  coinbase = false,
  token = false,
): string =>
  Buffer.from(
    encodeTransactionBCH({
      version: 2,
      locktime: 0,
      inputs: [
        {
          outpointTransactionHash: Uint8Array.from(
            Buffer.from(coinbase ? '00'.repeat(32) : '22'.repeat(32), 'hex'),
          ),
          outpointIndex: coinbase ? 0xffffffff : 0,
          sequenceNumber: 0xffffffff,
          unlockingBytecode: coinbase ? Uint8Array.from([1, 1]) : new Uint8Array(),
        },
      ],
      outputs: [
        {
          valueSatoshis: value,
          lockingBytecode: Uint8Array.from(Buffer.from(bytecode, 'hex')),
          ...(token
            ? {
                token: {
                  amount: 1n,
                  category: Uint8Array.from(Buffer.from('33'.repeat(32), 'hex')),
                },
              }
            : {}),
        },
      ],
    }),
  ).toString('hex');

/** Synthetic confirmed tip exactly 100 blocks after the Axion checkpoint. */
const tipHeight = 661748;
const tipHex = '01'.repeat(80);
let raw: string;
let row: Row;
let requests: Request[];
let sockets: MockSocket[];
let handler: (request: Request) => unknown;
/** Constructs the real read provider over the mocked TLS endpoint. */
const provider = () =>
  createBitcoinCashElectrumProvider({ hostname: 'bch-indexer.example', port: 50002 });

/** Serves one fixed offline handshake and stable source-address snapshot. */
const baseHandler = (request: Request): unknown => {
  switch (request.method) {
    case 'server.version':
      return ['Fulcrum offline fixture', '1.5'];
    case 'blockchain.block.header':
      return axionHeader;
    case 'blockchain.headers.get_tip':
      return { height: tipHeight, hex: tipHex };
    case 'blockchain.scripthash.listunspent':
      return [row];
    case 'blockchain.transaction.get':
      return raw;
    default:
      throw new Error('Unexpected test method');
  }
};

beforeEach(() => {
  vi.mocked(decodeTransactionBCH).mockClear();
  raw = parentHex();
  row = { tx_hash: hash(raw), tx_pos: 0, height: tipHeight, value: 123456789 };
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

describe('createBitcoinCashElectrumProvider', () => {
  describe('getHeight', () => {
    /**
     * @target getHeight authenticates the real Axion header before reading height
     * @dependencies TLS socket mocked; real crypto and captured offline header.
     * @scenario Negotiate Electrum1.5 and authenticate the BCH Axion checkpoint.
     * @expected Native double-SHA256 equals BCHN's fixed hash before a height read.
     */
    it('authenticates the real Axion header before reading height', async () => {
      expect(Buffer.from(axionHeader, 'hex').length).toEqual(80);
      expect(hash(axionHeader)).toEqual(BCH_AXION_CHECKPOINT.hash);
      await expect(provider().getHeight()).resolves.toEqual(tipHeight);
      expect(requests.map(({ method, params }) => ({ method, params }))).toEqual([
        { method: 'server.version', params: ['Rosen BCH UI', ['1.5', '1.6']] },
        { method: 'blockchain.block.header', params: [661648, 0] },
        { method: 'blockchain.headers.get_tip', params: [] },
      ]);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target getHeight rejects a different chain checkpoint
     * @dependencies TLS mocked; native hash implementation unchanged.
     * @scenario Flip one checkpoint-header byte while preserving80-byte framing.
     * @expected Chain identity fails before any UTXO, parent or tip read.
     */
    it('rejects a different chain checkpoint', async () => {
      handler = (request) =>
        request.method === 'blockchain.block.header'
          ? `01${axionHeader.slice(2)}`
          : baseHandler(request);
      await expect(provider().getHeight()).rejects.toThrow('checkpoint identity mismatch');
      expect(requests).toHaveLength(2);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target getHeight rejects unsupported protocol %s
     * @dependencies TLS mocked.
     * @scenario Change only negotiated protocol to a version lacking token_filter.
     * @expected Rejection before checkpoint or balance reads, with no fallback.
     */
    it.each(['1.4', '2.0', '1.6.1'])('rejects unsupported protocol %s', async (version) => {
      handler = (request) =>
        request.method === 'server.version' ? ['Fulcrum', version] : baseHandler(request);
      await expect(provider().getHeight()).rejects.toThrow('protocol 1.5 or 1.6');
      expect(requests).toHaveLength(1);
    });

    /**
     * @target getHeight accepts offered protocol %s
     * @dependencies TLS mocked; exact offered protocol range unchanged.
     * @scenario Select a1.5 patch or the zero-padded1.6.0 upper boundary.
     * @expected Versions inside1.5..1.6 are accepted without widening the range.
     */
    it.each(['1.5.3', '1.6.0'])('accepts offered protocol %s', async (version) => {
      handler = (request) =>
        request.method === 'server.version' ? ['Fulcrum', version] : baseHandler(request);
      await expect(provider().getHeight()).resolves.toEqual(tipHeight);
    });

    /**
     * @target getHeight rejects malformed tip %#
     * @dependencies TLS mocked.
     * @scenario Supply one malformed tip field after a valid handshake.
     * @expected A safe height and exactly80 bytes of header are required.
     */
    it.each([
      { height: -1, hex: tipHex },
      { height: 661647, hex: tipHex },
      { height: tipHeight + 0.5, hex: tipHex },
      { height: tipHeight, hex: '00' },
      { height: tipHeight, hex: 'zz'.repeat(80) },
    ])('rejects malformed tip %#', async (tip) => {
      handler = (request) =>
        request.method === 'blockchain.headers.get_tip' ? tip : baseHandler(request);
      await expect(provider().getHeight()).rejects.toThrow(/chain tip|header length|hexadecimal/);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });
  });

  describe('getSpendableUtxos', () => {
    /**
     * @target getSpendableUtxos joins bounded TLS reads to authenticated parent outputs
     * @dependencies TLS mocked; real JSON framing, crypto and libauth3 decoder.
     * @scenario Read a confirmed native parent, then re-read its list and tip.
     * @expected Exact satoshis/script/parent, explicit token exclusion, stable snapshot.
     */
    it('joins bounded TLS reads to authenticated parent outputs', async () => {
      await expect(provider().getSpendableUtxos(address)).resolves.toEqual([
        {
          txId: row.tx_hash,
          index: 0,
          value: 123456789n,
          scriptPubKey: script,
          parentTransactionHex: raw,
          height: tipHeight,
          confirmations: 1,
          coinbase: false,
        },
      ]);
      const scriptHash = createHash('sha256')
        .update(Buffer.from(script, 'hex'))
        .digest()
        .reverse()
        .toString('hex');
      expect(
        requests
          .filter(({ method }) => method === 'blockchain.scripthash.listunspent')
          .map(({ params }) => params),
      ).toEqual([
        [scriptHash, 'exclude_tokens'],
        [scriptHash, 'exclude_tokens'],
      ]);
      expect(
        requests.find(({ method }) => method === 'blockchain.transaction.get')?.params,
      ).toEqual([row.tx_hash, false]);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target getSpendableUtxos rejects an unsupported source address %#
     * @dependencies TLS mocked; real libauth address validation.
     * @scenario Change source to testnet, token-aware, P2SH or malformed CashAddr.
     * @expected The source is refused before a TLS socket is created.
     */
    it.each([
      addressFor(script, 'bchtest'),
      addressFor(script, 'bitcoincash', true),
      addressFor(`a914${'11'.repeat(20)}87`),
      address.toUpperCase(),
      address.split(':')[1],
      'invalid',
    ])('rejects an unsupported source address %#', async (source) => {
      await expect(provider().getSpendableUtxos(source)).rejects.toThrow(/mainnet P2PKH|CashAddr/);
      expect(mocked.connect).not.toHaveBeenCalled();
    });

    /**
     * @target getSpendableUtxos applies native confirmation policy %#
     * @dependencies TLS mocked; canonical raw parents retained.
     * @scenario Change only confirmation height or coinbase maturity.
     * @expected Mempool and99-confirmation coinbase are excluded;100 is accepted.
     */
    it.each([
      { coinbase: false, height: 0, count: 0 },
      { coinbase: true, height: tipHeight - 98, count: 0 },
      { coinbase: true, height: tipHeight - 99, count: 1 },
    ])('applies native confirmation policy %#', async ({ coinbase, height, count }) => {
      raw = parentHex(123456789n, script, coinbase);
      row = { ...row, tx_hash: hash(raw), height };
      const result = await provider().getSpendableUtxos(address);
      expect(result).toHaveLength(count);
      if (count) expect(result[0].confirmations).toEqual(100);
    });

    /**
     * @target getSpendableUtxos rejects malformed native list row %#
     * @dependencies TLS mocked.
     * @scenario Change one listed amount, height, index, hash or token field.
     * @expected Malformed metadata is rejected before any raw parent is fetched.
     */
    it.each([
      { value: -1 },
      { value: 0.1 },
      { value: 2_100_000_000_000_001 },
      { value: Number.MAX_SAFE_INTEGER + 1 },
      { value: '123456789' },
      { height: tipHeight + 1 },
      { height: -1 },
      { tx_pos: -1 },
      { tx_pos: 0x100000000 },
      { tx_hash: '12' },
      { token_data: null },
    ])('rejects malformed native list row %#', async (change) => {
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent'
          ? [{ ...row, ...change }]
          : baseHandler(request);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('Malformed native');
      expect(requests.some(({ method }) => method === 'blockchain.transaction.get')).toEqual(false);
    });

    /**
     * @target getSpendableUtxos rejects duplicate listed outpoints
     * @dependencies TLS mocked.
     * @scenario Return the same otherwise valid outpoint twice.
     * @expected Duplicate rejection before balance aggregation or parent lookup.
     */
    it('rejects duplicate listed outpoints', async () => {
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? [row, row] : baseHandler(request);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('Duplicate');
    });

    /**
     * @target getSpendableUtxos rejects an oversized UTXO list
     * @dependencies TLS mocked;1001 individually valid distinct outpoints.
     * @scenario Exceed the supported UTXO cardinality by one.
     * @expected Explicit bound exhaustion without silently truncating the balance.
     */
    it('rejects an oversized UTXO list', async () => {
      const rows = Array.from({ length: 1001 }, (_, index) => ({ ...row, tx_pos: index }));
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? rows : baseHandler(request);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('UTXO count limit');
    });

    /**
     * @target getSpendableUtxos authenticates the parent transaction hash
     * @dependencies TLS mocked; original canonical parent unchanged.
     * @scenario Change only the listed txid to another valid64-character hash.
     * @expected The returned raw transaction cannot authenticate that outpoint.
     */
    it('authenticates the parent transaction hash', async () => {
      row.tx_hash = '55'.repeat(32);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow(
        'parent transaction hash mismatch',
      );
    });

    /**
     * @target getSpendableUtxos authenticates claimed output field %#
     * @dependencies TLS mocked; hash-correct canonical parent unchanged.
     * @scenario Change only the claimed amount or output index.
     * @expected Each parent-output binding is independently authenticated.
     */
    it.each([{ value: 123456790 }, { tx_pos: 1 }])(
      'authenticates claimed output field %#',
      async (change) => {
        row = { ...row, ...change };
        await expect(provider().getSpendableUtxos(address)).rejects.toThrow(
          'parent output mismatch',
        );
      },
    );

    /**
     * @target getSpendableUtxos authenticates the exact source script
     * @dependencies TLS mocked; alternative canonical parent with correct txid.
     * @scenario Change only the output script relative to the requested source.
     * @expected Foreign-address output rejection despite a matching parent hash.
     */
    it('authenticates the exact source script', async () => {
      raw = parentHex(123456789n, `76a914${'44'.repeat(20)}88ac`);
      row.tx_hash = hash(raw);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('parent output mismatch');
    });

    /**
     * @target getSpendableUtxos rejects CashTokens hidden by indexer metadata
     * @dependencies TLS mocked; libauth encodes and decodes a real CashToken prefix.
     * @scenario The list hides token_data but the authenticated raw output has a token.
     * @expected Raw-byte token rejection even with exclude_tokens requested.
     */
    it('rejects CashTokens hidden by indexer metadata', async () => {
      raw = parentHex(123456789n, script, false, true);
      row.tx_hash = hash(raw);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('parent output mismatch');
    });

    /**
     * @target getSpendableUtxos allows an unrelated sibling CashToken output
     * @dependencies TLS mocked; actual libauth token encoding and decoding.
     * @scenario A native target output shares a parent with an unrelated token output.
     * @expected The native source output remains eligible; only its own token matters.
     */
    it('allows an unrelated sibling CashToken output', async () => {
      const parent = decodeTransactionBCH(Uint8Array.from(Buffer.from(raw, 'hex')));
      if (typeof parent === 'string') throw new Error(parent);
      parent.outputs.push({
        valueSatoshis: 1000n,
        lockingBytecode: Uint8Array.from(Buffer.from(`76a914${'44'.repeat(20)}88ac`, 'hex')),
        token: { amount: 1n, category: new Uint8Array(32).fill(3) },
      });
      raw = Buffer.from(encodeTransactionBCH(parent)).toString('hex');
      row.tx_hash = hash(raw);
      await expect(provider().getSpendableUtxos(address)).resolves.toHaveLength(1);
    });

    /**
     * @target getSpendableUtxos decodes a shared large parent once per transaction id
     * @dependencies TLS mocked; real918kB parent decoder instrumented only for count.
     * @scenario Two listed outputs share one27000-output canonical parent.
     * @expected The authenticated parent is fetched and decoded once, with exact assets.
     */
    it('decodes a shared large parent once per transaction id', async () => {
      const parent = decodeTransactionBCH(Uint8Array.from(Buffer.from(raw, 'hex')));
      if (typeof parent === 'string') throw new Error(parent);
      parent.outputs = Array.from({ length: 27_000 }, () => ({
        valueSatoshis: 1000n,
        lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
      }));
      raw = Buffer.from(encodeTransactionBCH(parent)).toString('hex');
      expect(raw.length / 2).toBeGreaterThan(918_000);
      expect(raw.length / 2).toBeLessThan(1_000_000);
      const rows = Array.from({ length: 2 }, (_, index) => ({
        ...row,
        tx_hash: hash(raw),
        tx_pos: index,
        value: 1000,
      }));
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? rows : baseHandler(request);
      vi.mocked(decodeTransactionBCH).mockClear();
      const result = await provider().getSpendableUtxos(address);
      expect(result).toHaveLength(2);
      expect(result.reduce((sum, utxo) => sum + utxo.value, 0n)).toEqual(2000n);
      expect(decodeTransactionBCH).toHaveBeenCalledOnce();
      expect(requests.filter(({ method }) => method === 'blockchain.transaction.get')).toHaveLength(
        1,
      );
    });

    /**
     * @target getSpendableUtxos bounds returned parent copies separately from the decoded cache
     * @dependencies TLS mocked; one real918kB parent and three listed native outputs.
     * @scenario Repeating authenticated parent hex exceeds the returned-context cap.
     * @expected The snapshot fails before returned copies can amplify serialized JSON.
     */
    it('bounds returned parent copies separately from the decoded cache', async () => {
      const actual = await vi.importActual<typeof import('@bitauth/libauth')>('@bitauth/libauth');
      const parent = actual.decodeTransactionBCH(Uint8Array.from(Buffer.from(raw, 'hex')));
      if (typeof parent === 'string') throw new Error(parent);
      parent.outputs = Array.from({ length: 27_000 }, () => ({
        valueSatoshis: 1000n,
        lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
      }));
      raw = Buffer.from(encodeTransactionBCH(parent)).toString('hex');
      expect(raw.length).toBeLessThan(4_000_000);
      expect(raw.length * 3).toBeGreaterThan(4_000_000);
      const rows = Array.from({ length: 3 }, (_, index) => ({
        ...row,
        tx_hash: hash(raw),
        tx_pos: index,
        value: 1000,
      }));
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? rows : baseHandler(request);
      vi.mocked(decodeTransactionBCH).mockClear();
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow(
        'returned UTXO context limit',
      );
      expect(decodeTransactionBCH).toHaveBeenCalledOnce();
      expect(requests.filter(({ method }) => method === 'blockchain.transaction.get')).toHaveLength(
        1,
      );
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target getSpendableUtxos checks the operation deadline after parent parsing
     * @dependencies TLS mocked; real decoder, with deterministic wall-clock expiry.
     * @scenario One large parent decode crosses the operation deadline before24 rows.
     * @expected Expiry stops the loop after one parse and releases the session.
     */
    it('checks the operation deadline after parent parsing', async () => {
      const actual = await vi.importActual<typeof import('@bitauth/libauth')>('@bitauth/libauth');
      const parent = actual.decodeTransactionBCH(Uint8Array.from(Buffer.from(raw, 'hex')));
      if (typeof parent === 'string') throw new Error(parent);
      parent.outputs = Array.from({ length: 27_000 }, () => ({
        valueSatoshis: 1000n,
        lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
      }));
      raw = Buffer.from(encodeTransactionBCH(parent)).toString('hex');
      const rows = Array.from({ length: 24 }, (_, index) => ({
        ...row,
        tx_hash: hash(raw),
        tx_pos: index,
        value: 1000,
      }));
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? rows : baseHandler(request);
      vi.useFakeTimers({ toFake: ['Date'] });
      const initialTime = Date.now();
      vi.mocked(decodeTransactionBCH)
        .mockClear()
        .mockImplementationOnce((bytes) => {
          const result = actual.decodeTransactionBCH(bytes);
          vi.setSystemTime(initialTime + 101);
          return result;
        });
      const bounded = createBitcoinCashElectrumProvider({
        hostname: 'bch-indexer.example',
        port: 50002,
        timeoutMs: 100,
      });
      await expect(bounded.getSpendableUtxos(address)).rejects.toThrow('session expired');
      expect(decodeTransactionBCH).toHaveBeenCalledOnce();
      expect(
        requests.filter(({ method }) => method === 'blockchain.scripthash.listunspent'),
      ).toHaveLength(1);
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });

    /**
     * @target getSpendableUtxos rejects %s parent encoding
     * @dependencies TLS mocked; hash corresponds to the deliberately malformed raw.
     * @scenario Supply a hash-correct incomplete parent or noncanonical CompactSize.
     * @expected Decoder/canonicality failure independently of the hash binding.
     */
    it.each(['incomplete', 'noncanonical'])('rejects %s parent encoding', async (variant) => {
      raw = variant === 'incomplete' ? '00' : `${raw.slice(0, 8)}fd0100${raw.slice(10)}`;
      row.tx_hash = hash(raw);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('canonical BCH parent');
    });

    /**
     * @target getSpendableUtxos bounds raw parent bytes independently of frame size
     * @dependencies TLS mocked; reply remains below the transport frame maximum.
     * @scenario Exceed raw-parent byte policy by one byte.
     * @expected Size failure before hashing or decoding the oversized parent.
     */
    it('bounds raw parent bytes independently of frame size', async () => {
      raw = '00'.repeat(1_000_001);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow(
        'bounded BCH hexadecimal',
      );
    });

    /**
     * @target getSpendableUtxos bounds the aggregate native balance
     * @dependencies TLS mocked; real decoded multi-output parent.
     * @scenario Two individually valid maximum outputs exceed the aggregate money cap.
     * @expected Balance aggregation fails before an impossible native total escapes.
     */
    it('bounds the aggregate native balance', async () => {
      const one = encodeTransactionBCH({
        version: 2,
        locktime: 0,
        inputs: [
          {
            outpointTransactionHash: new Uint8Array(32).fill(2),
            outpointIndex: 0,
            sequenceNumber: 0xffffffff,
            unlockingBytecode: new Uint8Array(),
          },
        ],
        outputs: [0, 1].map(() => ({
          valueSatoshis: 2_100_000_000_000_000n,
          lockingBytecode: Uint8Array.from(Buffer.from(script, 'hex')),
        })),
      });
      raw = Buffer.from(one).toString('hex');
      const rows = [0, 1].map((index) => ({
        ...row,
        tx_hash: hash(raw),
        tx_pos: index,
        value: 2_100_000_000_000_000,
      }));
      handler = (request) =>
        request.method === 'blockchain.scripthash.listunspent' ? rows : baseHandler(request);
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('money limit');
      expect(requests.filter(({ method }) => method === 'blockchain.transaction.get')).toHaveLength(
        1,
      );
    });

    /**
     * @target getSpendableUtxos rejects final %s drift
     * @dependencies TLS mocked; first list and tip remain fully valid.
     * @scenario Change only the final list, tip height, or tip header hash.
     * @expected No snapshot is returned across mempool or chain drift.
     */
    it.each(['list', 'height', 'header'])('rejects final %s drift', async (variant) => {
      let lists = 0;
      let tips = 0;
      handler = (request) => {
        if (
          request.method === 'blockchain.scripthash.listunspent' &&
          ++lists === 2 &&
          variant === 'list'
        )
          return [];
        if (request.method === 'blockchain.headers.get_tip' && ++tips === 2) {
          return {
            height: variant === 'height' ? tipHeight + 1 : tipHeight,
            hex: variant === 'header' ? '02'.repeat(80) : tipHex,
          };
        }
        return baseHandler(request);
      };
      await expect(provider().getSpendableUtxos(address)).rejects.toThrow('snapshot changed');
      expect(sockets[0].destroy).toHaveBeenCalledOnce();
    });
  });

  describe('getAddressAssets', () => {
    /**
     * @target getAddressAssets returns exact authenticated native satoshis
     * @dependencies TLS mocked; actual UTXO reader, crypto and decoder.
     * @scenario Aggregate the authenticated source outputs for the asset read port.
     * @expected Exact bigint satoshis and the native-only empty token collection.
     */
    it('returns exact authenticated native satoshis', async () => {
      await expect(provider().getAddressAssets(address)).resolves.toEqual({
        nativeToken: 123456789n,
        tokens: [],
      });
    });

    /**
     * @target getAddressAssets preserves the exact maximum satoshi amount
     * @dependencies TLS mocked; real native decoder and safe-integer JSON amount.
     * @scenario Read exactly the maximum BCH money amount through numeric JSON.
     * @expected No rounding occurs when the safe integer is converted to bigint.
     */
    it('preserves the exact maximum satoshi amount', async () => {
      raw = parentHex(2_100_000_000_000_000n);
      row = { ...row, tx_hash: hash(raw), value: 2_100_000_000_000_000 };
      await expect(provider().getAddressAssets(address)).resolves.toEqual({
        nativeToken: 2_100_000_000_000_000n,
        tokens: [],
      });
    });
  });
});
