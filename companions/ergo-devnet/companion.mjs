import assert from 'node:assert/strict';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { FEE_RATIO_DIVISOR } from '@rosen-bridge/minimum-fee/dist/constants.js';
import { extractFeeFromBox } from '@rosen-bridge/minimum-fee/dist/utils.js';
import { assertExactTokenLockValue } from './policy.mjs';

const ID = /^[0-9a-f]{64}$/;
const DECIMAL = /^(0|[1-9][0-9]*)$/;
const TARGET = /^t[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{29,39}$/;
const configPath = process.argv[2];
const enabled = process.argv.includes('--enable-sign-and-submit');
assert(configPath && process.argv.length === (enabled ? 4 : 3), 'Usage: node companion.mjs <config.json> [--enable-sign-and-submit]');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
assert.equal(config.network, 'devnet');
assert.equal(config.zcashNetwork, 'regtest');
assert.equal(config.nodeUrl, 'http://127.0.0.1:19051');
assert(Number.isInteger(config.port) && config.port >= 1024 && config.port <= 65535);
assert(/^http:\/\/(localhost|127\.0\.0\.1):[0-9]+$/.test(config.allowedOrigin));
for (const field of ['firstBlockId', 'allowedBoxId', 'tokenId', 'minFeeNft']) {
  assert(ID.test(config[field]), `${field} must be an exact 32-byte ID`);
}
for (const field of ['amount', 'bridgeFee', 'networkFee', 'ergoFee']) {
  assert(DECIMAL.test(config[field]) && BigInt(config[field]) > 0n, `${field} must be positive`);
}
assert(TARGET.test(config.targetAddress), 'exact transparent Zcash target required');
function assertRegtestP2pkh(address) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = 0n;
  for (const character of address) {
    const digit = alphabet.indexOf(character);
    assert(digit >= 0, 'invalid Zcash target character');
    value = value * 58n + BigInt(digit);
  }
  const bytes = [];
  while (value > 0n) { bytes.push(Number(value & 255n)); value >>= 8n; }
  bytes.reverse();
  const raw = Buffer.concat([Buffer.alloc((address.match(/^1*/) ?? [''])[0].length), Buffer.from(bytes)]);
  assert.equal(raw.length, 26, 'Zcash target must be transparent P2PKH');
  assert.equal(raw.subarray(0, 2).toString('hex'), '1d25', 'Zcash target is not regtest P2PKH');
  const hash = (input) => createHash('sha256').update(input).digest();
  assert(raw.subarray(22).equals(hash(hash(raw.subarray(0, 22))).subarray(0, 4)),
    'Zcash target checksum mismatch');
}
assertRegtestP2pkh(config.targetAddress);
assert(typeof config.lockAddress === 'string' && typeof config.keyFile === 'string' &&
  typeof config.apiKeyFile === 'string', 'lock and local credential paths required');
const lockTree = wasm.Address.from_base58(config.lockAddress).to_ergo_tree().to_base16_bytes();
const keyFile = JSON.parse(fs.readFileSync(config.keyFile, 'utf8'));
assert(ID.test(keyFile.secretHex), 'disposable Ergo key fixture required');
const ownerKey = wasm.SecretKey.dlog_from_bytes(Buffer.from(keyFile.secretHex, 'hex'));
const ownerAddress = ownerKey.get_address().to_base58(wasm.NetworkPrefix.Mainnet);
const ownerTree = ownerKey.get_address().to_ergo_tree().to_base16_bytes();
const apiKey = JSON.parse(fs.readFileSync(config.apiKeyFile, 'utf8')).apiKey;
assert(typeof apiKey === 'string' && apiKey.length > 0, 'local node API key required');
const session = randomBytes(24).toString('hex');
let pending;
let submitted = false;
let signing = false;

async function node(route, body) {
  const response = await fetch(`${config.nodeUrl}${route}`, {
    method: body === undefined ? 'GET' : 'POST',
    redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { api_key: apiKey, 'content-type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`Ergo node HTTP ${response.status} at ${route}`);
  const raw = await response.text();
  assert(Buffer.byteLength(raw) <= 4_000_000, 'node response too large');
  return raw ? JSON.parse(raw) : null;
}

async function assertDevnet() {
  const info = await node('/info');
  assert.equal(info.network, 'devnet');
  assert.equal(info.appVersion, '6.0.3');
  assert.equal(info.peersCount, 0);
  assert(Number.isSafeInteger(info.fullHeight) && info.fullHeight > 0);
  assert.deepEqual(await node('/blocks/at/1'), [config.firstBlockId]);
  return info.fullHeight;
}

async function ownedBox() {
  const box = await node(`/utxo/byId/${config.allowedBoxId}`);
  assert.equal(box.boxId, config.allowedBoxId);
  assert.equal(box.ergoTree, ownerTree);
  assert.deepEqual(box.assets?.map((asset) => [asset.tokenId, String(asset.amount)]),
    [[config.tokenId, config.amount]], 'approved rsZEC input unavailable');
  return box;
}

async function assertCurrentFees(height) {
  const boxes = await node(`/blockchain/box/unspent/byTokenId/${config.minFeeNft}?offset=0&limit=50`);
  assert(Array.isArray(boxes) && boxes.length < 50, 'bounded MinFee box set required');
  const matches = boxes.filter((box) => box.assets?.length === 2 &&
    box.assets.some((asset) => asset.tokenId === config.minFeeNft) &&
    box.assets.some((asset) => asset.tokenId === config.tokenId));
  assert.equal(matches.length, 1, 'one active MinFee box required');
  const box = await node(`/utxo/byId/${matches[0].boxId}`);
  assert.equal(box.boxId, matches[0].boxId);
  const transaction = await node(`/blockchain/transaction/byId/${box.transactionId}`);
  assert(transaction.numConfirmations >= 1, 'MinFee box must be confirmed');
  const fees = extractFeeFromBox(box, (register) => wasm.Constant.decode_from_base16(register).to_js());
  const active = fees.reverse().find((fee) =>
    Number.isSafeInteger(fee.heights?.ergo) && fee.heights.ergo < height)?.configs?.zcash;
  assert(active, 'active Ergo-to-Zcash fee required');
  const amount = BigInt(config.amount);
  const variable = amount * active.feeRatio / FEE_RATIO_DIVISOR;
  const bridgeFee = active.bridgeFee > variable ? active.bridgeFee : variable;
  assert.equal(BigInt(config.bridgeFee), bridgeFee, 'bridge fee differs from active MinFee');
  assert.equal(BigInt(config.networkFee), active.networkFee, 'network fee differs from active MinFee');
}

function bodyJson(request) {
  return new Promise((resolve, reject) => {
    let value = '';
    request.on('data', (chunk) => {
      value += chunk;
      if (value.length > 100_000) request.destroy(new Error('request too large'));
    });
    request.on('end', () => { try { resolve(JSON.parse(value)); } catch (error) { reject(error); } });
    request.on('error', reject);
  });
}

function outputValue(output) { return BigInt(output.value); }

async function sign(unsignedProxy) {
  assert(enabled && !signing && !pending && !submitted, 'signing is disabled or already used');
  signing = true;
  try {
  const height = await assertDevnet();
  await assertCurrentFees(height);
  const box = await ownedBox();
  assert(Array.isArray(unsignedProxy?.inputs) && unsignedProxy.inputs.length === 1 &&
    unsignedProxy.inputs[0].boxId === config.allowedBoxId, 'input differs from approved box');
  assert(Array.isArray(unsignedProxy.dataInputs) && unsignedProxy.dataInputs.length === 0);
  const unsigned = wasm.UnsignedTransaction.from_json(JSON.stringify(unsignedProxy));
  const canonical = unsigned.to_js_eip12();
  assert.deepEqual(canonical.inputs.map((input) => input.boxId), [config.allowedBoxId]);
  assert(Array.isArray(canonical.outputs) && canonical.outputs.length >= 2 && canonical.outputs.length <= 3);
  const [lock, ...rest] = canonical.outputs;
  const expectedR4 = wasm.Constant.from_coll_coll_byte([
    'zcash', config.targetAddress, config.networkFee, config.bridgeFee, ownerAddress,
  ].map((value) => Buffer.from(value))).encode_to_base16();
  assert.equal(lock.ergoTree, lockTree, 'Lock address differs from approved deployment');
  assert.deepEqual(Object.keys(lock.additionalRegisters ?? {}), ['R4'], 'Lock has unexpected registers');
  assert.equal(lock.additionalRegisters?.R4, expectedR4, 'Zcash target or Rosen fees differ');
  assert.deepEqual(lock.assets?.map((asset) => [asset.tokenId, String(asset.amount)]),
    [[config.tokenId, config.amount]], 'Lock amount or token differs');
  const feeCandidate = wasm.ErgoBoxCandidate.new_miner_fee_box(
    wasm.BoxValue.from_i64(wasm.I64.from_str(config.ergoFee)), 1,
  );
  const feeTree = feeCandidate.ergo_tree().to_base16_bytes();
  assert(rest.filter((output) => output.ergoTree === feeTree).length === 1, 'one miner fee required');
  for (const output of rest) {
    assert(output.ergoTree === ownerTree || output.ergoTree === feeTree, 'foreign change output');
    assert((output.assets ?? []).length === 0, 'unexpected token in change or fee');
    assert(Object.keys(output.additionalRegisters ?? {}).length === 0, 'unexpected output registers');
    if (output.ergoTree === feeTree) assert.equal(outputValue(output), BigInt(config.ergoFee));
  }
  assertExactTokenLockValue(lock, rest, box.value);
  const boxes = wasm.ErgoBoxes.empty();
  boxes.add(wasm.ErgoBox.from_json(JSON.stringify(box)));
  const headers = wasm.BlockHeaders.from_json((await node('/blocks/lastHeaders/10')).map(JSON.stringify));
  const context = new wasm.ErgoStateContext(wasm.PreHeader.from_block_header(headers.get(0)), headers);
  const keys = new wasm.SecretKeys(); keys.add(ownerKey);
  const signed = wasm.Wallet.from_secrets(keys).sign_transaction(context, unsigned, boxes, wasm.ErgoBoxes.empty());
  assert.equal(signed.id().to_str(), unsigned.id().to_str());
  assert(wasm.verify_tx_input_proof(0, context, signed, boxes, wasm.ErgoBoxes.empty()));
  const transaction = JSON.parse(signed.to_json());
  assert.equal(await node('/transactions/check', transaction), signed.id().to_str());
  pending = { id: signed.id().to_str(), transaction };
  return signed.to_js_eip12();
  } catch (error) {
    signing = false;
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    assert.equal(request.headers.host, `127.0.0.1:${config.port}`);
    assert.equal(request.headers.origin, config.allowedOrigin);
    response.setHeader('access-control-allow-origin', config.allowedOrigin);
    response.setHeader('vary', 'Origin');
    response.setHeader('access-control-allow-headers', 'content-type,x-rosen-session');
    response.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
    response.setHeader('cache-control', 'no-store');
    if (request.method === 'OPTIONS') { response.writeHead(204).end(); return; }
    const supplied = request.headers['x-rosen-session'];
    assert(typeof supplied === 'string' && supplied.length === session.length &&
      timingSafeEqual(Buffer.from(supplied), Buffer.from(session)), 'session authorization required');
    const url = new URL(request.url, `http://127.0.0.1:${config.port}`);
    let result;
    if (request.method === 'GET' && url.pathname === '/account') {
      await assertDevnet(); result = {
        network: 'devnet', address: ownerAddress, enabled,
        lockAddress: config.lockAddress, targetAddress: config.targetAddress, tokenId: config.tokenId,
      };
    } else if (request.method === 'GET' && url.pathname === '/utxos') {
      await assertDevnet(); result = [await ownedBox()];
    } else if (request.method === 'GET' && url.pathname === '/balance') {
      await assertDevnet();
      const box = await ownedBox();
      const token = url.searchParams.get('token');
      assert(token === config.tokenId || token === 'ERG', 'unsupported balance token');
      result = token === 'ERG' ? String(box.value) : String(box.assets.find((asset) => asset.tokenId === token)?.amount ?? 0);
    } else if (request.method === 'POST' && url.pathname === '/sign') {
      result = await sign(await bodyJson(request));
    } else if (request.method === 'POST' && url.pathname === '/submit') {
      assert(enabled && pending && !submitted, 'no approved signed transaction');
      const body = await bodyJson(request);
      assert.deepEqual(body, { id: pending.id }, 'signed transaction identity differs');
      await assertDevnet();
      assert.equal(await node('/transactions/check', pending.transaction), pending.id);
      submitted = true;
      result = await node('/transactions', pending.transaction);
      assert.equal(result, pending.id, 'node returned another transaction ID');
    } else { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: error.message }));
  }
});
server.listen(config.port, '127.0.0.1', () => {
  process.stdout.write(`Ergo devnet companion on 127.0.0.1:${config.port}\nSession code: ${session}\nSigning: ${enabled ? 'enabled' : 'disabled'}\n`);
});
