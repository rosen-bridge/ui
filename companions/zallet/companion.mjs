import assert from 'node:assert/strict';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import * as ergoWasm from 'ergo-lib-wasm-nodejs';

const TYPE_INTENT = 'rosen-zcash-lock-intent';
const TYPE_RECEIPT = 'rosen-zcash-lock-receipt';
const ZIP317_PLACEHOLDER_ZAT = 5_000n;
// Zcash and Zebra 6.3.0 both use this fixed Regtest genesis. Zebra reports
// `chain: "test"` on Regtest, so that RPC field cannot distinguish the two.
const REGTEST_GENESIS_HASH = '029f11d80ef9765602235e1bc9727e3eb6ba20839319f761fee920d63401e327';
// Zcash Protocol Specification, Testnet genesis block in RPC byte order:
// https://zips.z.cash/protocol/protocol.pdf
const TESTNET_GENESIS_HASH = '05a60a92d99d85997cce3b87616c089f6124d7342af37106edc76126334a2c38';
// Zcash Protocol Specification, Mainnet genesis block in RPC byte order:
// https://zips.z.cash/protocol/protocol.pdf
const MAINNET_GENESIS_HASH = '00040fe8ec8471911baa1db1266ea15dd06b4a8a5c453883c000b031973dce08';
const GENESIS_HASHES = Object.freeze({regtest: REGTEST_GENESIS_HASH, testnet: TESTNET_GENESIS_HASH, mainnet: MAINNET_GENESIS_HASH});
const MIN_PUBLIC_NETWORK_VERIFICATION_PROGRESS = 0.9999;
// https://zips.z.cash/zip-0258
const MAINNET_NU63_HEIGHT = 3_428_143;
const NU63_BRANCH_ID = '37a5165b';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HEX8 = /^[0-9a-f]{8}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const HEX102 = /^[0-9a-f]{102}$/;

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function die(message) { throw new Error(message); }
function exactKeys(value, keys, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
  assert.deepEqual(Object.keys(value), keys, `${label} fields/order mismatch`);
}
function decimal(value, label, { positive = false } = {}) {
  assert.equal(typeof value, 'string', `${label} must be a decimal string`);
  assert(/^(?:0|[1-9][0-9]*)$/.test(value), `${label} must be canonical unsigned decimal`);
  const parsed = BigInt(value);
  if (positive) assert(parsed > 0n, `${label} must be positive`);
  return parsed;
}
function canonicalDate(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  const parsed = new Date(value);
  assert(!Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value, `${label} must be canonical ISO-8601 UTC`);
  return parsed;
}
function readCanonicalJson(file, canonicalize, label) {
  const bytes = fs.readFileSync(file);
  assert(bytes.length > 0 && bytes[0] !== 0xef, `${label} must not contain a BOM`);
  assert(bytes.at(-1) !== 0x0a && bytes.at(-1) !== 0x0d, `${label} must not end in a newline`);
  const value = JSON.parse(bytes.toString('utf8'));
  const canonical = Buffer.from(JSON.stringify(canonicalize(value)), 'utf8');
  assert(bytes.equals(canonical), `${label} bytes are not canonical`);
  return { value, bytes, sha256: sha256(bytes) };
}
function canonicalIntent(value) {
  exactKeys(value, ['type','version','requestId','source','reserveAddress','amountZat','target','fees','rosenDataHex','createdAt','expiresAt'], 'intent');
  assert.equal(value.type, TYPE_INTENT); assert.equal(value.version, 1); assert(UUID.test(value.requestId), 'invalid requestId');
  exactKeys(value.source, ['chain','network','genesisHash'], 'intent.source');
  assert.equal(value.source.chain, 'zcash'); assert(['regtest','testnet','mainnet'].includes(value.source.network)); assert(HEX64.test(value.source.genesisHash));
  assert.equal(typeof value.reserveAddress, 'string'); decimal(value.amountZat, 'amountZat', { positive: true });
  exactKeys(value.target, ['chain','address'], 'intent.target'); assert.equal(value.target.chain, 'ergo'); assert.equal(typeof value.target.address, 'string');
  exactKeys(value.fees, ['bridgeFee','networkFee'], 'intent.fees'); decimal(value.fees.bridgeFee, 'bridgeFee'); decimal(value.fees.networkFee, 'networkFee');
  assert(HEX102.test(value.rosenDataHex), 'rosenDataHex must be 102 lowercase hex characters');
  const created = canonicalDate(value.createdAt, 'createdAt'); const expires = canonicalDate(value.expiresAt, 'expiresAt');
  assert(expires > created, 'expiresAt must follow createdAt'); assert(expires > new Date(), 'intent expired');
  return {type:value.type,version:value.version,requestId:value.requestId,source:{chain:value.source.chain,network:value.source.network,genesisHash:value.source.genesisHash},reserveAddress:value.reserveAddress,amountZat:value.amountZat,target:{chain:value.target.chain,address:value.target.address},fees:{bridgeFee:value.fees.bridgeFee,networkFee:value.fees.networkFee},rosenDataHex:value.rosenDataHex,createdAt:value.createdAt,expiresAt:value.expiresAt};
}
function canonicalApproval(value) {
  exactKeys(value, ['type','version','requestId','intentSha256','reviewSha256','approved','approvedAt'], 'approval');
  assert.equal(value.type, 'rosen-zcash-sign-approval'); assert.equal(value.version, 1); assert(UUID.test(value.requestId));
  assert(HEX64.test(value.intentSha256)); assert(HEX64.test(value.reviewSha256)); assert.equal(value.approved, true); canonicalDate(value.approvedAt, 'approvedAt');
  return {type:value.type,version:value.version,requestId:value.requestId,intentSha256:value.intentSha256,reviewSha256:value.reviewSha256,approved:value.approved,approvedAt:value.approvedAt};
}
function base58Decode(value) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let number = 0n;
  for (const char of value) { const digit = alphabet.indexOf(char); assert(digit >= 0, 'invalid Base58 character'); number = number * 58n + BigInt(digit); }
  const body = [];
  while (number > 0n) { body.push(Number(number & 0xffn)); number >>= 8n; }
  body.reverse();
  let zeroes = 0; while (value[zeroes] === '1') zeroes++;
  return Buffer.concat([Buffer.alloc(zeroes), Buffer.from(body)]);
}
function zcashP2pkhScript(address, network) {
  const decoded = base58Decode(address); assert.equal(decoded.length, 26, 'reserve/placeholder must be a transparent P2PKH address');
  const payload = decoded.subarray(0, 22); const checksum = decoded.subarray(22);
  const expected = createHash('sha256').update(createHash('sha256').update(payload).digest()).digest().subarray(0,4);
  assert(checksum.equals(expected), 'invalid Zcash address checksum');
  const prefix = payload.subarray(0,2).toString('hex');
  assert.equal(prefix, network === 'mainnet' ? '1cb8' : '1d25', 'Zcash transparent prefix/network mismatch');
  return `76a914${payload.subarray(2).toString('hex')}88ac`;
}
function u64be(value, label) {
  const n = decimal(value, label); assert(n <= 0xffffffffffffffffn, `${label} exceeds u64`);
  const out = Buffer.alloc(8); out.writeBigUInt64BE(n); return out;
}
function deriveRosenData(intent) {
  const key = Buffer.from(ergoWasm.Address.from_base58(intent.target.address).content_bytes());
  assert.equal(key.length, 33, 'target must be an Ergo P2PK address'); assert([2,3].includes(key[0]), 'target must use a compressed Ergo P2PK key');
  return Buffer.concat([Buffer.from([0]),u64be(intent.fees.bridgeFee,'bridgeFee'),u64be(intent.fees.networkFee,'networkFee'),Buffer.from([33]),key]).toString('hex');
}
function validateRpcUrl(value, label) {
  assert.equal(typeof value, 'string', `${label} URL must be a string`);
  const url = new URL(value);
  assert(!url.username && !url.password, `${label} URL must not embed credentials`);
  assert(url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1','[::1]','localhost'].includes(url.hostname)),
    `${label} URL must use HTTPS or loopback HTTP`);
  return value;
}
function loadConfig(file) {
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  exactKeys(c, ['type','version','network','zallet','zebra','activeContracts','transformer','inspector'], 'config');
  assert.equal(c.type, 'rosen-zcash-zallet-companion-config'); assert.equal(c.version, 1);
  assert(['regtest','testnet','mainnet'].includes(c.network), 'this companion accepts Regtest, Testnet, or Mainnet');
  validateRpcUrl(c.zallet.url, 'Zallet RPC'); validateRpcUrl(c.zebra.url, 'Zebra RPC');
  return c;
}
function basicCookie(file) {
  const cookie = fs.readFileSync(file, 'utf8').trim(); assert(/^[^:\s]+:[^\s]+$/.test(cookie), 'invalid RPC cookie');
  return `Basic ${Buffer.from(cookie).toString('base64')}`;
}
let rpcId = 0;
async function rpc(url, cookieFile, method, params, allowError = false) {
  const response = await fetch(url, {method:'POST',redirect:'error',signal:AbortSignal.timeout(20_000),headers:{authorization:basicCookie(cookieFile),'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++rpcId,method,params})});
  assert.equal(response.status, 200, `RPC HTTP ${method}`); const value = await response.json();
  if (!allowError) assert(value.error == null, `RPC ${method}: ${value.error?.message ?? 'error'}`);
  return value;
}
function hashFile(file) { return sha256(fs.readFileSync(file)); }
function verifiedExecutable(spec, label) { assert(path.isAbsolute(spec.path), `${label} path must be absolute`); assert.equal(hashFile(spec.path), spec.sha256, `${label} SHA-256 mismatch`); return spec.path; }
function zatToZec(zat) { assert(zat <= BigInt(Number.MAX_SAFE_INTEGER)); return Number(zat) / 1e8; }
function activeReserve(config, expected) {
  const watcher = JSON.parse(fs.readFileSync(config.activeContracts.watcher, 'utf8'));
  const guard = JSON.parse(fs.readFileSync(config.activeContracts.guard, 'utf8'));
  assert.equal(watcher.zcash.addresses.lock, expected, 'active watcher reserve differs from intent');
  assert.equal(guard.zcash.chain.addresses.lock, expected, 'active guard reserve differs from intent');
}
async function currentChain(config, intent) {
  assert.equal(intent.source.network, config.network, 'configured network differs from intent');
  const expectedGenesis = GENESIS_HASHES[config.network];
  assert(expectedGenesis, 'unsupported configured Zcash network');
  assert.equal(intent.source.genesisHash, expectedGenesis, 'intent does not identify the configured Zcash network');
  const info=(await rpc(config.zebra.url,config.zebra.cookieFile,'getblockchaininfo',[])).result;
  assert(info && typeof info === 'object', 'missing Zebra chain information');
  if (config.network !== 'regtest') {
    assert.equal(info.chain,config.network === 'mainnet' ? 'main' : 'test','Zebra is on another network');
    assert(Number.isSafeInteger(info.blocks) && info.blocks > 0,'invalid Zebra block height');
    assert(Number.isSafeInteger(info.headers) && info.headers === info.blocks,'Zebra headers are not fully connected');
    assert(typeof info.verificationprogress === 'number' &&
      Number.isFinite(info.verificationprogress) &&
      info.verificationprogress >= MIN_PUBLIC_NETWORK_VERIFICATION_PROGRESS &&
      info.verificationprogress <= 1,'Zebra verification is incomplete');
  }
  const branchId=info.consensus?.nextblock;
  assert.equal(typeof branchId,'string','Zebra did not report a next-block consensus branch');
  assert(HEX8.test(branchId),'invalid Zebra next-block consensus branch');
  if (config.network === 'mainnet') {
    assert(info.blocks >= MAINNET_NU63_HEIGHT, 'Zebra Mainnet has not reached NU6.3');
    assert.equal(info.consensus?.chaintip,NU63_BRANCH_ID,'Zebra Mainnet tip is not NU6.3');
    assert.equal(branchId,NU63_BRANCH_ID,'Zebra Mainnet next block is not NU6.3');
  }
  const genesis=(await rpc(config.zebra.url,config.zebra.cookieFile,'getblockhash',[0])).result;
  assert.equal(genesis,intent.source.genesisHash,'Zebra genesis differs from intent');
  assert.equal(genesis,expectedGenesis,'Zebra genesis is not canonical for the configured network');
  return branchId;
}
function reviewInspection(inspection, intent, rosenScript, pcztSha256, branchId, feeZat) {
  assert(HEX64.test(pcztSha256),'invalid PCZT SHA-256');
  assert(HEX8.test(branchId),'invalid expected consensus branch');
  const fee=decimal(feeZat,'ZIP-317 fee',{positive:true});
  assert([5,6].includes(inspection.tx_version),'unsupported Zcash transaction version');
  assert.equal(inspection.consensus_branch_id,branchId,'PCZT consensus branch differs from Zebra');
  assert(inspection.wallet_created && inspection.signing_hints, 'PCZT is not recognized as wallet-created');
  assert.equal(decimal(String(inspection.fee_zat),'PCZT fee'),fee,'PCZT fee differs from ZIP-317 transformer');
  assert(inspection.transparent.inputs.length > 0);
  assert.equal(inspection.transparent.outputs.length, 3); assert.equal(inspection.sapling.spends,0); assert.equal(inspection.sapling.outputs.length,0);
  assert.equal(inspection.orchard.actions,0); assert.equal(inspection.ironwood.actions,0);
  const amount = BigInt(intent.amountZat);
  const reserve = inspection.transparent.outputs.filter(o => o.address === intent.reserveAddress && BigInt(o.value_zat) === amount);
  const metadata = inspection.transparent.outputs.filter(o => BigInt(o.value_zat) === 0n && o.address === undefined && o.user_address === undefined);
  assert.equal(reserve.length,1,'inspection must contain one exact reserve output'); assert.equal(metadata.length,1,'inspection must contain one zero non-address output');
  const change = inspection.transparent.outputs.filter(o => o !== reserve[0] && o !== metadata[0]); assert.equal(change.length,1); assert(BigInt(change[0].value_zat)>0n && typeof change[0].address==='string','missing transparent change');
  return {type:'rosen-zcash-lock-review',version:1,requestId:intent.requestId,source:{network:intent.source.network,genesisHash:intent.source.genesisHash,consensusBranchId:branchId},reserveAddress:intent.reserveAddress,amountZat:intent.amountZat,target:{chain:'ergo',address:intent.target.address},fees:{bridgeFee:intent.fees.bridgeFee,networkFee:intent.fees.networkFee,transactionFee:feeZat},rosenDataHex:intent.rosenDataHex,rosenScriptHex:rosenScript,pcztSha256,transaction:{version:inspection.tx_version,expiryHeight:inspection.expiry_height,inputCount:inspection.transparent.inputs.length,outputs:[{role:'reserve',valueZat:intent.amountZat,address:intent.reserveAddress},{role:'metadata',valueZat:'0',scriptPubKeyHex:rosenScript},{role:'change',valueZat:String(change[0].value_zat),address:change[0].address}]},privacyPolicy:inspection.privacy_policy,approvalRequired:true};
}
function writeExact(file, value, flag='wx') { fs.writeFileSync(file, Buffer.from(JSON.stringify(value),'utf8'), {flag,mode:0o600}); }
function runTransformer(config, input, output, placeholderScript, rosenScript) {
  const executable = verifiedExecutable(config.transformer, 'transformer');
  const result = spawnSync(executable,[input,output,ZIP317_PLACEHOLDER_ZAT.toString(),placeholderScript,rosenScript],{encoding:'utf8',windowsHide:true,timeout:20_000});
  assert.equal(result.status,0,`transformer failed: ${result.stderr || result.stdout}`); return JSON.parse(result.stdout);
}
function inspectRaw(config, rawHex, branchId) {
  const executable = verifiedExecutable(config.inspector, 'inspector');
  const result = spawnSync(executable,[],{input:JSON.stringify({raw_tx_hex:rawHex,expected_branch_id:branchId}),encoding:'utf8',windowsHide:true,timeout:20_000,maxBuffer:8*1024*1024});
  assert.equal(result.status,0,`inspector failed: ${result.stderr || result.stdout}`); return JSON.parse(result.stdout);
}

async function prepare(configFile, intentFile, sessionDir) {
  const config=loadConfig(configFile); const parsed=readCanonicalJson(intentFile,canonicalIntent,'intent'); const intent=parsed.value;
  assert.equal(intent.source.network,config.network,'intent and companion networks differ'); activeReserve(config,intent.reserveAddress);
  assert.equal(deriveRosenData(intent),intent.rosenDataHex,'rosenDataHex does not match target and fees');
  zcashP2pkhScript(intent.reserveAddress,intent.source.network); const placeholderScript=zcashP2pkhScript(config.zallet.placeholderAddress,intent.source.network);
  const branchId=await currentChain(config,intent);
  fs.mkdirSync(sessionDir,{recursive:false});
  const created=(await rpc(config.zallet.url,config.zallet.cookieFile,'pczt_create',[config.zallet.fromAccount,[{address:intent.reserveAddress,amount:zatToZec(BigInt(intent.amountZat))},{address:config.zallet.placeholderAddress,amount:zatToZec(ZIP317_PLACEHOLDER_ZAT)}],1,'NoPrivacy','any_transparent'])).result;
  const base=path.join(sessionDir,'base.pczt.b64'); const transformed=path.join(sessionDir,'transformed.pczt.b64');
  fs.writeFileSync(base,created.pczt,{flag:'wx',mode:0o600});
  const rosenScript=`6a33${intent.rosenDataHex}`; const transform=runTransformer(config,base,transformed,placeholderScript,rosenScript);
  assert.equal(transform.status,'transformed');
  const feeZat=decimal(transform.feeZat,'ZIP-317 transformer fee',{positive:true}).toString();
  const pczt=fs.readFileSync(transformed,'utf8').trim(); const inspection=(await rpc(config.zallet.url,config.zallet.cookieFile,'pczt_inspect',[pczt])).result;
  assert.equal(transform.inputCount,inspection.transparent.inputs.length);
  assert.equal(transform.outputCount,inspection.transparent.outputs.length);
  const pcztSha256=hashFile(transformed); const review=reviewInspection(inspection,intent,rosenScript,pcztSha256,branchId,feeZat); const reviewFile=path.join(sessionDir,'review.json'); writeExact(reviewFile,review);
  const state={type:'rosen-zcash-lock-private-state',version:1,requestId:intent.requestId,intentSha256:parsed.sha256,reviewSha256:hashFile(reviewFile),pcztSha256,consensusBranchId:branchId,feeZat,privacyPolicy:created.privacy_policy};
  writeExact(path.join(sessionDir,'private-state.json'),state);
  console.log(JSON.stringify({status:'awaiting-human-approval',requestId:intent.requestId,intentSha256:parsed.sha256,reviewFile,reviewSha256:state.reviewSha256}));
}

async function submit(configFile,intentFile,sessionDir,approvalFile,receiptFile) {
  const config=loadConfig(configFile); const parsed=readCanonicalJson(intentFile,canonicalIntent,'intent'); const intent=parsed.value;
  assert.equal(intent.source.network,config.network,'intent and companion networks differ');
  assert.equal(deriveRosenData(intent),intent.rosenDataHex,'rosenDataHex does not match target and fees');
  const approval=readCanonicalJson(approvalFile,canonicalApproval,'approval').value; const state=JSON.parse(fs.readFileSync(path.join(sessionDir,'private-state.json'),'utf8'));
  assert.equal(approval.requestId,intent.requestId); assert.equal(approval.intentSha256,parsed.sha256); assert.equal(approval.reviewSha256,state.reviewSha256);
  const reviewFile=path.join(sessionDir,'review.json'); const approvedReviewBytes=fs.readFileSync(reviewFile);
  assert.equal(state.requestId,intent.requestId); assert.equal(state.intentSha256,parsed.sha256); assert.equal(sha256(approvedReviewBytes),approval.reviewSha256,'approved review hash mismatch');
  activeReserve(config,intent.reserveAddress);
  const branchId=await currentChain(config,intent);
  assert.equal(branchId,state.consensusBranchId,'Zcash consensus branch changed after approval');
  const feeZat=decimal(state.feeZat,'approved ZIP-317 fee',{positive:true}).toString();
  const pcztFile=path.join(sessionDir,'transformed.pczt.b64'); const pcztSha256=hashFile(pcztFile); assert.equal(pcztSha256,state.pcztSha256); const pczt=fs.readFileSync(pcztFile,'utf8').trim();
  const preSign=(await rpc(config.zallet.url,config.zallet.cookieFile,'pczt_inspect',[pczt])).result;
  const approvedReview=reviewInspection(preSign,intent,`6a33${intent.rosenDataHex}`,pcztSha256,branchId,feeZat);
  assert(approvedReviewBytes.equals(Buffer.from(JSON.stringify(approvedReview),'utf8')),'PCZT no longer matches the approved review');
  activeReserve(config,intent.reserveAddress);
  const signed=(await rpc(config.zallet.url,config.zallet.cookieFile,'pczt_sign',[pczt,approvedReview.privacyPolicy,true])).result;
  assert.equal(signed.transparent_signed,preSign.transparent.inputs.length); for(const key of ['unsigned_transparent','unsigned_sapling','unsigned_orchard','unsigned_ironwood']) assert.deepEqual(signed[key],[]);
  const extracted=(await rpc(config.zallet.url,config.zallet.cookieFile,'pczt_extract',[signed.pczt])).result; assert(extracted.stored); assert(HEX64.test(extracted.txid)); assert(/^(?:[0-9a-f]{2})+$/.test(extracted.hex));
  const native=inspectRaw(config,extracted.hex,branchId); assert.equal(native.txid,extracted.txid);
  assert.equal(native.consensus_branch_id,branchId); assert.equal(native.version.number,approvedReview.transaction.version);
  assert.equal(native.expiry_height,approvedReview.transaction.expiryHeight);
  assert(native.fully_transparent&&!native.coinbase&&!native.shielded.present); assert.equal(native.transparent.outputs.length,3);
  const approvedInputs=preSign.transparent.inputs.map(input=>[input.prevout_txid,input.prevout_index]);
  const rawInputs=native.transparent.inputs.map(input=>[input.prevout_txid,input.prevout_index]);
  assert.equal(rawInputs.length,approvedReview.transaction.inputCount,'raw input count differs from approved review');
  assert.deepEqual(rawInputs,approvedInputs,'raw inputs differ from approved PCZT');
  const reserveScript=zcashP2pkhScript(intent.reserveAddress,intent.source.network); const rosenScript=`6a33${intent.rosenDataHex}`;
  assert.equal(native.transparent.outputs.filter(o=>o.value_zat===Number(intent.amountZat)&&o.script_pubkey_hex===reserveScript).length,1);
  assert.equal(native.transparent.outputs.filter(o=>o.value_zat===0&&o.script_pubkey_hex===rosenScript).length,1);
  const approvedChange=approvedReview.transaction.outputs.find(o=>o.role==='change'); assert(approvedChange,'approved review has no change output');
  const approvedChangeScript=zcashP2pkhScript(approvedChange.address,intent.source.network);
  assert.equal(native.transparent.outputs.filter(o=>BigInt(o.value_zat)===BigInt(approvedChange.valueZat)&&o.script_pubkey_hex===approvedChangeScript).length,1,'raw change output differs from approved review');
  let inputs=0n; for(const input of native.transparent.inputs){const utxo=(await rpc(config.zebra.url,config.zebra.cookieFile,'gettxout',[input.prevout_txid,input.prevout_index,true])).result; assert(utxo,'input no longer unspent before submit'); inputs+=BigInt(Math.round(utxo.value*1e8));}
  const outputs=native.transparent.outputs.reduce((sum,o)=>sum+BigInt(o.value_zat),0n); assert.equal(inputs-outputs,BigInt(feeZat),'raw transaction fee mismatch');
  assert.equal(intent.source.network,config.network,'intent and companion networks differ');
  assert.equal(deriveRosenData(intent),intent.rosenDataHex,'rosenDataHex does not match target and fees');
  activeReserve(config,intent.reserveAddress);
  assert.equal(await currentChain(config,intent),branchId,'Zcash consensus branch changed before submit');
  const existing=await rpc(config.zebra.url,config.zebra.cookieFile,'getrawtransaction',[extracted.txid,1],true); assert.equal(existing.error?.code,-5,'transaction already known before one-shot submit');
  assert(new Date(intent.expiresAt)>new Date(),'intent expired immediately before submit');
  assert(!fs.existsSync(receiptFile),'receipt already exists'); const marker=path.join(sessionDir,'submission-attempt.json');
  writeExact(marker,{type:'rosen-zcash-submission-attempt',version:1,requestId:intent.requestId,intentSha256:parsed.sha256,txid:extracted.txid,rawTxSha256:sha256(Buffer.from(extracted.hex,'hex')),status:'started-do-not-retry-automatically'});
  const returned=(await rpc(config.zebra.url,config.zebra.cookieFile,'sendrawtransaction',[extracted.hex])).result; assert.equal(returned,extracted.txid);
  const receipt={type:TYPE_RECEIPT,version:1,requestId:intent.requestId,intentSha256:parsed.sha256,sourceGenesisHash:intent.source.genesisHash,txid:extracted.txid,rawTxSha256:sha256(Buffer.from(extracted.hex,'hex')),status:'submitted'};
  writeExact(receiptFile,receipt); console.log(JSON.stringify({status:'submitted',receiptFile,txid:receipt.txid,receiptSha256:hashFile(receiptFile)}));
}

function serveOrigin(value) {
  const origin = new URL(value);
  assert.equal(origin.origin, value, 'browser origin must be one exact origin without a path');
  assert(!origin.username && !origin.password, 'browser origin must not contain credentials');
  assert(origin.protocol === 'https:' || (origin.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(origin.hostname)),
    'browser origin must use HTTPS or loopback HTTP');
  return value;
}
function activeReserveAddress(config) {
  const watcher = JSON.parse(fs.readFileSync(config.activeContracts.watcher, 'utf8'));
  const guard = JSON.parse(fs.readFileSync(config.activeContracts.guard, 'utf8'));
  const address = watcher?.zcash?.addresses?.lock;
  assert.equal(typeof address, 'string', 'active watcher has no Zcash reserve');
  assert.equal(guard?.zcash?.chain?.addresses?.lock, address, 'active watcher and guard reserves differ');
  zcashP2pkhScript(address, config.network);
  return address;
}
function assertWalletTip(status, zebraHeight, zebraHash) {
  const validTip = tip => tip && Number.isSafeInteger(tip.height) && tip.height >= 0 &&
    typeof tip.blockhash === 'string' && HEX64.test(tip.blockhash);
  assert(validTip(status?.node_tip), 'Zallet node tip is invalid');
  assert(validTip(status?.wallet_tip), 'Zallet wallet tip is invalid');
  assert(Number.isSafeInteger(status.fully_synced_height) && status.fully_synced_height >= 0,
    'Zallet synchronized height is invalid');
  assert.equal(typeof status.locked,'boolean','Zallet lock status is invalid');
  assert(Number.isSafeInteger(zebraHeight) && zebraHeight >= 0 && HEX64.test(zebraHash),
    'Zebra tip is invalid');
  assert.equal(status.node_tip.height,zebraHeight,'Zallet node is not at the configured Zebra tip');
  assert.equal(status.node_tip.blockhash,zebraHash,'Zallet node tip differs from configured Zebra');
  assert.equal(status.wallet_tip.height,status.node_tip.height,'Zallet wallet height is not synchronized');
  assert.equal(status.wallet_tip.blockhash,status.node_tip.blockhash,'Zallet wallet tip differs from its node');
  assert.equal(status.fully_synced_height,status.node_tip.height,'Zallet wallet scan is incomplete');
}
async function readAccount(config) {
  const genesisHash = GENESIS_HASHES[config.network];
  assert(genesisHash, 'unsupported configured Zcash network');
  await currentChain(config, {source:{network:config.network,genesisHash}});
  const status = (await rpc(config.zallet.url,config.zallet.cookieFile,'getwalletstatus',[])).result;
  assert(status?.node_tip && Number.isSafeInteger(status.node_tip.height) && status.node_tip.height >= 0,
    'Zallet node tip is invalid');
  const zebraInfo = (await rpc(config.zebra.url,config.zebra.cookieFile,'getblockchaininfo',[])).result;
  const zebraHash = (await rpc(config.zebra.url,config.zebra.cookieFile,'getblockhash',[status.node_tip.height])).result;
  assertWalletTip(status,zebraInfo?.blocks,zebraHash);
  const reserveAddress = activeReserveAddress(config);
  const accountId = config.zallet.fromAccount;
  assert(UUID.test(accountId), 'configured account is not a UUID');
  const accounts = (await rpc(config.zallet.url,config.zallet.cookieFile,'z_listaccounts',[true])).result;
  assert(Array.isArray(accounts), 'Zallet accounts response is not an array');
  const matches = accounts.filter(item => item?.account_uuid === accountId);
  assert.equal(matches.length,1,'configured Zallet account is not unique');
  const account = matches[0];
  assert(account && Array.isArray(account.addresses), 'configured Zallet account is unavailable');
  assert(typeof account.seedfp === 'string' && account.seedfp.length > 0,
    'configured Zallet account has no seed fingerprint');
  assert(Number.isSafeInteger(account.zip32_account_index) && account.zip32_account_index >= 0,
    'configured Zallet account has no ZIP-32 index');
  const inventory = (await rpc(config.zallet.url,config.zallet.cookieFile,'listaddresses',[])).result;
  assert(Array.isArray(inventory),'Zallet address inventory is not an array');
  const mnemonic = inventory.filter(item => item?.source === 'mnemonic_seed');
  const belongsToAccount = group => group?.seedfp === account.seedfp &&
    group.account === account.zip32_account_index;
  const derived = mnemonic.flatMap(item => Array.isArray(item.derived_transparent) ? item.derived_transparent : [])
    .filter(belongsToAccount);
  const changeAddresses = new Set(derived.flatMap(group => Array.isArray(group.changeAddresses) ? group.changeAddresses : []));
  const externalTransparent = derived.flatMap(group => Array.isArray(group.addresses) ? group.addresses : []);
  const validIndex = value => Number.isSafeInteger(value) && value >= 0;
  let transparentAddress = account.addresses.find(item => validIndex(item?.diversifier_index) &&
    typeof item.transparent === 'string' && !changeAddresses.has(item.transparent) &&
    externalTransparent.includes(item.transparent))?.transparent;
  if (!transparentAddress) {
    const unified = mnemonic.flatMap(item => Array.isArray(item.unified) ? item.unified : [])
      .filter(belongsToAccount).flatMap(group => Array.isArray(group.addresses) ? group.addresses : []);
    const accountUa = account.addresses.find(item => validIndex(item?.diversifier_index) &&
      typeof item.ua === 'string' && unified.some(entry => entry &&
        entry.diversifier_index === item.diversifier_index && entry.address === item.ua &&
        Array.isArray(entry.receiver_types) && entry.receiver_types.includes('p2pkh')))?.ua;
    assert(accountUa,'configured account has no external transparent receiver');
    const receivers = (await rpc(config.zallet.url,config.zallet.cookieFile,'z_listunifiedreceivers',[accountUa])).result;
    transparentAddress = receivers?.p2pkh;
  }
  assert(typeof transparentAddress === 'string' && !changeAddresses.has(transparentAddress),
    'configured account has no external transparent receiver');
  zcashP2pkhScript(transparentAddress,config.network);
  const balance = (await rpc(config.zallet.url,config.zallet.cookieFile,'z_getbalanceforaccount',[accountId,1])).result;
  assert.equal(balance?.minimum_confirmations,1,'unexpected Zallet confirmation policy');
  assert(balance.pools && typeof balance.pools === 'object' && !Array.isArray(balance.pools),'invalid Zallet balance pools');
  const value = balance.pools.transparent === undefined ? 0 : balance.pools.transparent.valueZat;
  assert(Number.isSafeInteger(value) && value >= 0,'invalid transparent spendable balance');
  return {network:config.network,genesisHash,accountId,reserveAddress,transparentAddress,
    spendableZat:String(value),minimumConfirmations:1};
}
async function serve(configFile, allowedOrigin, portText = '60494') {
  const config = loadConfig(configFile);
  serveOrigin(allowedOrigin);
  assert(/^[1-9][0-9]{0,4}$/.test(portText),'invalid serve port');
  const port = Number(portText); assert(port <= 65535,'invalid serve port');
  await readAccount(config);
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 15*60*1000;
  const expectedHost = `127.0.0.1:${port}`;
  const server = http.createServer(async (request,response) => {
    const send = (status, body) => {
      response.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',
        'x-content-type-options':'nosniff','referrer-policy':'no-referrer','vary':'Origin'});
      response.end(JSON.stringify(body));
    };
    const count = key => request.rawHeaders.filter((_,index) => index % 2 === 0 && request.rawHeaders[index].toLowerCase() === key).length;
    if (count('host') !== 1 || request.headers.host !== expectedHost ||
        count('origin') !== 1 || request.headers.origin !== allowedOrigin ||
        request.url !== '/v1/account' || Date.now() >= expiresAt) { send(403,{error:'forbidden'}); return; }
    response.setHeader('access-control-allow-origin',allowedOrigin);
    if (request.method === 'OPTIONS' && request.headers['access-control-request-method'] === 'GET' &&
        request.headers['access-control-request-headers']?.toLowerCase() === 'authorization') {
      response.setHeader('access-control-allow-methods','GET');
      response.setHeader('access-control-allow-headers','Authorization');
      if (request.headers['access-control-request-private-network'] === 'true') response.setHeader('access-control-allow-private-network','true');
      response.setHeader('access-control-max-age','0');
      send(204,{}); return;
    }
    if (request.method !== 'GET') { send(405,{error:'method not allowed'}); return; }
    if (count('authorization') !== 1 || !/^Bearer [0-9a-f]{64}$/.test(request.headers.authorization ?? '')) {
      send(401,{error:'unauthorized'}); return;
    }
    const supplied = Buffer.from(request.headers.authorization.slice(7),'hex');
    if (!timingSafeEqual(supplied,Buffer.from(token,'hex'))) { send(401,{error:'unauthorized'}); return; }
    try { send(200,await readAccount(config)); }
    catch { send(503,{error:'wallet unavailable'}); }
  });
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(port,'127.0.0.1',resolve); });
  setTimeout(() => server.close(),expiresAt-Date.now());
  console.log(JSON.stringify({url:`http://127.0.0.1:${port}/v1/account`,origin:allowedOrigin,token,expiresAt:new Date(expiresAt).toISOString()}));
}

const [command,configFile,intentFile,sessionDir,arg5,arg6]=process.argv.slice(2);
if(command==='prepare'&&configFile&&intentFile&&sessionDir&&!arg5) await prepare(configFile,intentFile,sessionDir);
else if(command==='submit'&&configFile&&intentFile&&sessionDir&&arg5&&arg6) await submit(configFile,intentFile,sessionDir,arg5,arg6);
else if(command==='serve'&&configFile&&intentFile&&!arg5&&!arg6) await serve(configFile,intentFile,sessionDir);
else die('usage: companion.mjs prepare <config> <intent> <new-session-dir> | submit <config> <intent> <session-dir> <approval> <receipt> | serve <config> <browser-origin> [port]');
