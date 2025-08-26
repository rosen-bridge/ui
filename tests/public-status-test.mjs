#!/usr/bin/env zx
// c && zx --install public-status-test.mjs
import { blake2b } from '@noble/hashes/blake2b';
import assert from 'assert';
import axios from 'axios';
import pkg from 'secp256k1';

const sign = (secret, message) => {
  const key = Uint8Array.from(Buffer.from(secret, 'hex'));
  const bytes = blake2b(message, {
    dkLen: 32,
  });
  const signed = pkg.ecdsaSign(bytes, key);
  return Buffer.from(signed.signature).toString('hex');
};

const id0 = '0000000000000000000000000000000000000000000000000000000000000000';
const id1 = '0000000000000000000000000000000000000000000000000000000000000001';
const id2 = '0000000000000000000000000000000000000000000000000000000000000002';
const id3 = '0000000000000000000000000000000000000000000000000000000000000003';

let guardSecret0 =
  'a7bcd47224d594830d53558848d88f7eb89d9a3b944a59cda11f478e803039eb';
const guardPk0 =
  '0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1';

const guardSecret1 =
  '5fe85ea89577306517175ee47b026decc60830dbc05e4e9b2cafad881fcd49f6';
const guardPk1 =
  '03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6';

const guardSecret2 =
  '73aa4fec273494700abd35fd8755a08aaf74b90d441ca9f02eef4344cce9caf4';
const guardPk2 =
  '03a6a1d4093e0a4e10ee725881b931eaaca10e92f10561cf40a369de79e43a4bbd';

const guardSecret3 =
  '2b7eeebaf521ffa7b84397a187e72f7cf7e0307389e31ccb70f2b3d14f057325';
const guardPk3 =
  '03a0fd33438b413ddd0781260901817615aab9e3933a102320f1f606a35b8ed099';

const apiBaseUrl = 'http://localhost:3000';

const mockTx0 = {
  txId: id0,
  chain: 'c1',
  txType: 'payment',
  txStatus: 'signed',
};
const mockTx1 = {
  txId: id1,
  chain: 'c1',
  txType: 'payment',
  txStatus: 'signed',
};
const mockTx2 = {
  txId: id2,
  chain: 'c1',
  txType: 'reward',
  txStatus: 'signed',
};
let validRequest2Timestamp;

const getTime = () => {
  return Math.floor(Date.now() / 1000);
};

const sortKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sortKeys(item));
  }

  return Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = sortKeys(obj[key]);
      return sortedObj;
    }, {});
};

const assertObjectsMatch = (_o1, _o2) => {
  const o1 = sortKeys(_o1);
  const o2 = sortKeys(_o2);
  const o1String = JSON.stringify(o1);
  const o2String = JSON.stringify(o2);
  if (o1String !== o2String) {
    console.error({ o1, o2 });
    throw new Error('assertObjectsMatch failed');
  }
};

const getMockTxExpectation = (tx, eventId, insertedAt) => {
  return {
    txId: tx.txId,
    chain: tx.chain,
    eventId,
    insertedAt,
    txType: tx.txType,
  };
};

const paramsToSignMessage = (params) => {
  return params.tx
    ? `${params.eventId}${params.status}${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}${params.timestamp}`
    : `${params.eventId}${params.status}${params.timestamp}`;
};

const submitStatus = async (params) => {
  const { guard, timestamp, eventId, status, tx } = params;

  let pk = guardPk0;
  let secret = guardPk0;

  switch (guard) {
    case 0:
      pk = guardPk0;
      secret = guardSecret0;
      break;

    case 1:
      pk = guardPk1;
      secret = guardSecret1;
      break;

    case 2:
      pk = guardPk2;
      secret = guardSecret2;
      break;

    case 3:
      pk = guardPk3;
      secret = guardSecret3;
      break;

    default:
      throw new Error('invalid guard');
  }

  const signature = sign(secret, paramsToSignMessage(params));

  return axios.post(`${apiBaseUrl}/api/v1/status/submit`, {
    date: timestamp,
    eventId,
    status,
    pk,
    signature,
    tx,
  });
};

const testInvalidTimestampPast = async () => {
  try {
    const response = await submitStatus({
      guard: 0,
      timestamp: getTime() - 30,
      eventId: id0,
      status: 'completed',
      tx: mockTx0,
    });

    assert(response.status === 403);
  } catch (error) {
    assert(error.response.status === 403);

    if (error.response.data.error !== 'invalid timestamp') {
      throw new Error('testInvalidTimestampPast: Failed');
    }
  }

  console.log('testInvalidTimestampPast: Passed');
};

const testInvalidTimestampFuture = async () => {
  try {
    const response = await submitStatus({
      guard: 0,
      timestamp: getTime() + 1,
      eventId: id0,
      status: 'completed',
      tx: mockTx0,
    });

    assert(response.status === 403);
  } catch (error) {
    assert(error.response.status === 403);

    if (error.response.data.error !== 'invalid timestamp') {
      throw new Error('testInvalidTimestampFuture: Failed');
    }
  }

  console.log('testInvalidTimestampFuture: Passed');
};

const testNotAllowedPk = async () => {
  try {
    const response = await submitStatus({
      guard: 2,
      timestamp: getTime(),
      eventId: id0,
      status: 'completed',
      tx: mockTx0,
    });

    assert(response.status === 403);
  } catch (error) {
    assert(error.response.status === 403);

    if (error.response.data.error !== 'public key not allowed') {
      throw new Error('testNotAllowedPk: Failed');
    }
  }

  console.log('testNotAllowedPk: Passed');
};

const testSignatureInvalid = async () => {
  const temp = guardSecret0;
  guardSecret0 = guardSecret1;

  try {
    const response = await submitStatus({
      guard: 0,
      timestamp: getTime(),
      eventId: id0,
      status: 'completed',
      tx: mockTx0,
    });

    assert(response.status === 403);
  } catch (error) {
    assert(error.response.status === 403);

    if (error.response.data.error !== 'signature verification failed') {
      throw new Error('testSignatureInvalid: Failed');
    }
  }

  guardSecret0 = temp;

  console.log('testSignatureInvalid: Passed');
};

const testValidRequest = async () => {
  const timestamp = getTime();
  const eventId = id0;

  let response = await submitStatus({
    guard: 0,
    timestamp,
    eventId,
    status: 'completed',
    tx: mockTx0,
  });
  assert(response.status === 200);
  await sleep(1000);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [guardPk0],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk0,
    insertedAt: response.data.items[0].insertedAt,
    status: 'completed',
    txStatus: mockTx0.txStatus,
    tx: getMockTxExpectation(
      mockTx0,
      eventId,
      response.data.items[0].insertedAt,
    ),
  });

  console.log(`testValidRequest: Passed`);
};

const testValidRequest2 = async () => {
  const timestamp = getTime() - 20;
  const eventId = id1;

  let response = await submitStatus({
    guard: 1,
    timestamp,
    eventId,
    status: 'pending-payment',
    tx: mockTx1,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);
  validRequest2Timestamp = response.data[eventId].updatedAt;

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [guardPk1],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(
      mockTx1,
      eventId,
      response.data.items[0].insertedAt,
    ),
  });

  // get guard status timeline of this eventId with another guard
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [guardPk3],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 0);

  // get guard status timeline of this eventId with all guards
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(
      mockTx1,
      eventId,
      response.data.items[0].insertedAt,
    ),
  });

  console.log(`testValidRequest2: Passed`);
};

const testDuplicateRequest = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  const timestamp = getTime();
  const eventId = id1;

  for (let i = 0; i < 2; i += 1) {
    const response = await submitStatus({
      guard: 1,
      timestamp: getTime(),
      eventId,
      status: 'pending-payment',
      tx: mockTx1,
    });
    assert(response.status === 200);
    await sleep(1000);
  }

  // get aggregated status of this eventId
  let response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp); // <

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt < timestamp); // <
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [guardPk1],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt < timestamp); // <
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(
      mockTx1,
      eventId,
      response.data.items[0].insertedAt,
    ),
  });

  console.log(`testDuplicateRequest: Passed`);
};

const testAggregateStatusChange = async () => {
  const eventId = id2;

  // =======
  // submit guard 0
  // =======
  let timestamp = getTime();
  let response = await submitStatus({
    guard: 0,
    timestamp,
    eventId,
    status: 'pending-payment',
    tx: undefined,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk0,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  // =======
  // submit guard 1
  // =======
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    guard: 1,
    timestamp,
    eventId,
    status: 'pending-payment',
    tx: undefined,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assert(response.data.items[0].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 2);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[1], {
    guardPk: guardPk0,
    insertedAt: response.data.items[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  // =======
  // submit guard 3
  // =======
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    guard: 3,
    timestamp,
    eventId,
    status: 'pending-payment',
    tx: undefined,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 2);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[1], {
    insertedAt: response.data.items[1].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 3);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk3,
    insertedAt: response.data.items[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[1], {
    guardPk: guardPk1,
    insertedAt: response.data.items[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[2], {
    guardPk: guardPk0,
    insertedAt: response.data.items[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  ////////////////////////////////////////////////////////////////////

  // =======
  // submit guard 0
  // =======
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    guard: 0,
    timestamp,
    eventId,
    status: 'in-reward',
    tx: mockTx2,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 3);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[1], {
    insertedAt: response.data.items[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[2], {
    insertedAt: response.data.items[2].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 4);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assert(response.data.items[3].insertedAt < timestamp);
  const txTimestamp = response.data.items[0].insertedAt;
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk0,
    insertedAt: response.data.items[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[1], {
    guardPk: guardPk3,
    insertedAt: response.data.items[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[2], {
    guardPk: guardPk1,
    insertedAt: response.data.items[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[3], {
    guardPk: guardPk0,
    insertedAt: response.data.items[3].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  // =======
  // submit guard 1
  // =======
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    guard: 1,
    timestamp,
    eventId,
    status: 'in-reward',
    tx: mockTx2,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 3);
  assert(response.data.items[0].insertedAt < timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[1], {
    insertedAt: response.data.items[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[2], {
    insertedAt: response.data.items[2].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 5);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assert(response.data.items[3].insertedAt < timestamp);
  assert(response.data.items[4].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: response.data.items[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[1], {
    guardPk: guardPk0,
    insertedAt: response.data.items[1].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[2], {
    guardPk: guardPk3,
    insertedAt: response.data.items[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[3], {
    guardPk: guardPk1,
    insertedAt: response.data.items[3].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[4], {
    guardPk: guardPk0,
    insertedAt: response.data.items[4].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  // =======
  // submit guard 3
  // =======
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    guard: 3,
    timestamp,
    eventId,
    status: 'in-reward',
    tx: mockTx2,
  });
  assert(response.status === 200);

  // get aggregated status of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${apiBaseUrl}/api/v1/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.items.length === 4);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assert(response.data.items[3].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: response.data.items[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[1], {
    insertedAt: response.data.items[1].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[2], {
    insertedAt: response.data.items[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[3], {
    insertedAt: response.data.items[3].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(`${apiBaseUrl}/api/v1/status/${eventId}/guards`, {
    guardPks: [],
  });
  assert(response.status === 200);
  assert(response.data.items.length === 6);
  assert(response.data.items[0].insertedAt >= timestamp);
  assert(response.data.items[1].insertedAt < timestamp);
  assert(response.data.items[2].insertedAt < timestamp);
  assert(response.data.items[3].insertedAt < timestamp);
  assert(response.data.items[4].insertedAt < timestamp);
  assert(response.data.items[5].insertedAt < timestamp);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk3,
    insertedAt: response.data.items[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[1], {
    guardPk: guardPk1,
    insertedAt: response.data.items[1].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[2], {
    guardPk: guardPk0,
    insertedAt: response.data.items[2].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data.items[3], {
    guardPk: guardPk3,
    insertedAt: response.data.items[3].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[4], {
    guardPk: guardPk1,
    insertedAt: response.data.items[4].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data.items[5], {
    guardPk: guardPk0,
    insertedAt: response.data.items[5].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  console.log(`testAggregateStatusChange: Passed`);
};

const testGetInvalidEventIds = async () => {
  // get aggregated status
  const response = await axios.post(`${apiBaseUrl}/api/v1/status`, {
    eventIds: [id3],
  });
  assert(response.status === 200);
  assert(Object.keys(response.data).length === 0);

  console.log(`testGetInvalidEventIds: Passed`);
};

const testGetInvalidEventTimeline = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/v1/status/${id3}`);
  assert(response.status === 200);
  assert(response.data.items.length === 0);

  console.log(`testGetInvalidEventTimeline: Passed`);
};

const testGetValidEventTimeline = async () => {
  const response = await axios.get(`${apiBaseUrl}/api/v1/status/${id1}`);
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assertObjectsMatch(response.data.items[0], {
    insertedAt: validRequest2Timestamp,
    status: 'waiting-for-confirmation',
    txStatus: null,
    tx: null,
  });

  console.log(`testGetValidEventTimeline: Passed`);
};

const testGetInvalidGuardEventTimeline = async () => {
  const response = await axios.post(
    `${apiBaseUrl}/api/v1/status/${id3}/guards`,
    {
      guardPks: [guardPk0],
    },
  );
  assert(response.status === 200);
  assert(response.data.items.length === 0);

  console.log(`testGetInvalidGuardEventTimeline: Passed`);
};

const testGetValidGuardEventTimeline = async () => {
  const response = await axios.post(
    `${apiBaseUrl}/api/v1/status/${id1}/guards`,
    {
      guardPks: [guardPk1],
    },
  );
  assert(response.status === 200);
  assert(response.data.items.length === 1);
  assertObjectsMatch(response.data.items[0], {
    guardPk: guardPk1,
    insertedAt: validRequest2Timestamp,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(mockTx1, id1, validRequest2Timestamp),
  });

  console.log(`testGetValidGuardEventTimeline: Passed`);
};

const testGetEventTimelinePagination = async () => {
  // page 1
  await (async () => {
    const response = await axios.get(
      `${apiBaseUrl}/api/v1/status/${id1}?offset=0&limit=10`,
    );
    assert(response.status === 200);
    assert(response.data.items.length === 10);
    for (let i = 0; i < 10; i += 1) {
      assertObjectsMatch(response.data.items[i], {
        insertedAt: 21 - i,
        status: 'finished',
        txStatus: null,
        tx: null,
      });
    }
  })();

  // page 2
  const response = await axios.get(
    `${apiBaseUrl}/api/v1/status/${id1}?offset=7&limit=20`,
  );

  assert(response.status === 200);
  assert(response.data.items.length === 5);
  for (let i = 0; i < 5; i += 1) {
    assertObjectsMatch(response.data.items[i], {
      insertedAt: 21 - 7 - i,
      status: 'finished',
      txStatus: null,
      tx: null,
    });
  }

  console.log(`testGetEventTimelinePagination: Passed`);
};

const testGetGuardEventTimelinePagination = async () => {
  // page 1
  await (async () => {
    const response = await axios.post(
      `${apiBaseUrl}/api/v1/status/${id1}/guards?offset=0&limit=10`,
      {
        guardPks: [guardPk1],
      },
    );
    assert(response.status === 200);
    assert(response.data.items.length === 10);
    for (let i = 0; i < 10; i += 1) {
      assertObjectsMatch(response.data.items[i], {
        guardPk: guardPk1,
        insertedAt: 21 - i,
        status: 'in-payment',
        txStatus: null,
        tx: null,
      });
    }
  })();

  // page 2
  const response = await axios.post(
    `${apiBaseUrl}/api/v1/status/${id1}/guards?offset=7&limit=20`,
    {
      guardPks: [guardPk1],
    },
  );
  assert(response.status === 200);
  assert(response.data.items.length === 5);
  for (let i = 0; i < 5; i += 1) {
    assertObjectsMatch(response.data.items[i], {
      guardPk: guardPk1,
      insertedAt: 21 - 7 - i,
      status: 'in-payment',
      txStatus: null,
      tx: null,
    });
  }

  console.log(`testGetGuardEventTimelinePagination: Passed`);
};

const insertMockDataForPaginationTest = async () => {
  console.log('inserting mock data for pagination test');
  const p = $`psql -p 5432 -U postgres -d public_status_test`.stdio('pipe');

  p.stdin.write('BEGIN;\n');
  p.stdin
    .write(`INSERT INTO aggregated_status_changed_entity ("id", "eventId", "insertedAt", "status", "txStatus", "txId", "txChain")
      VALUES
          (10, '${id1}', 10, 'finished', NULL, NULL, NULL),
          (11, '${id1}', 11, 'finished', NULL, NULL, NULL),
          (12, '${id1}', 12, 'finished', NULL, NULL, NULL),
          (13, '${id1}', 13, 'finished', NULL, NULL, NULL),
          (14, '${id1}', 14, 'finished', NULL, NULL, NULL),
          (15, '${id1}', 15, 'finished', NULL, NULL, NULL),
          (16, '${id1}', 16, 'finished', NULL, NULL, NULL),
          (17, '${id1}', 17, 'finished', NULL, NULL, NULL),
          (18, '${id1}', 18, 'finished', NULL, NULL, NULL),
          (19, '${id1}', 19, 'finished', NULL, NULL, NULL),
          (20, '${id1}', 20, 'finished', NULL, NULL, NULL),
          (21, '${id1}', 21, 'finished', NULL, NULL, NULL);

      INSERT INTO guard_status_changed_entity ("id", "eventId", "guardPk", "insertedAt", "status", "txStatus", "txId", "txChain")
      VALUES
          (10, '${id1}', '${guardPk1}', 10, 'in-payment', NULL, NULL, NULL),
          (11, '${id1}', '${guardPk1}', 11, 'in-payment', NULL, NULL, NULL),
          (12, '${id1}', '${guardPk1}', 12, 'in-payment', NULL, NULL, NULL),
          (13, '${id1}', '${guardPk1}', 13, 'in-payment', NULL, NULL, NULL),
          (14, '${id1}', '${guardPk1}', 14, 'in-payment', NULL, NULL, NULL),
          (15, '${id1}', '${guardPk1}', 15, 'in-payment', NULL, NULL, NULL),
          (16, '${id1}', '${guardPk1}', 16, 'in-payment', NULL, NULL, NULL),
          (17, '${id1}', '${guardPk1}', 17, 'in-payment', NULL, NULL, NULL),
          (18, '${id1}', '${guardPk1}', 18, 'in-payment', NULL, NULL, NULL),
          (19, '${id1}', '${guardPk1}', 19, 'in-payment', NULL, NULL, NULL),
          (20, '${id1}', '${guardPk1}', 20, 'in-payment', NULL, NULL, NULL),
          (21, '${id1}', '${guardPk1}', 21, 'in-payment', NULL, NULL, NULL);\n`);
  p.stdin.write('COMMIT;\n');

  p.stdin.end();

  await new Promise((r) => setTimeout(r, 500));

  console.log('done inserting mock data for pagination test');
};

const resetDB = async () => {
  console.log('resetting db');
  const p = $`psql -p 5432 -U postgres -d public_status_test`.stdio('pipe');

  p.stdin.write('BEGIN;\n');
  p.stdin.write('TRUNCATE TABLE tx_entity RESTART IDENTITY CASCADE;\n');
  p.stdin.write('TRUNCATE TABLE aggregated_status_entity;\n');
  p.stdin.write('TRUNCATE TABLE aggregated_status_changed_entity;\n');
  p.stdin.write('TRUNCATE TABLE guard_status_changed_entity;\n');
  p.stdin.write('TRUNCATE TABLE guard_status_entity;\n');
  p.stdin.write('COMMIT;\n');

  p.stdin.end();

  await new Promise((r) => setTimeout(r, 500));

  console.log('done resetting db');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resetSchema = async () => {
  await $`psql -p 5432 -U postgres -d public_status_test <<EOF
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO public_status_test_user;
  ALTER ROLE public_status_test_user SET search_path = public;
  EOF`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setupDB = async () => {
  await $`psql -p 5432 -U postgres -d postgres <<EOF
  DROP DATABASE public_status_test;
  CREATE DATABASE public_status_test;
  CREATE USER public_status_test_user;
  GRANT ALL PRIVILEGES ON DATABASE public_status_test TO public_status_test_user;
  \c public_status_test postgres;
  GRANT ALL ON SCHEMA public TO public_status_test_user;
  EOF`;
};

let api;
const startApi = async () => {
  await within(async () => {
    console.log('starting api');

    await $`export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use;`;

    cd(`apps/rosen`);

    await $`export ALLOWED_PKS="0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1,03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6,03a0fd33438b413ddd0781260901817615aab9e3933a102320f1f606a35b8ed099"`;
    await $`export POSTGRES_URL="postgresql://public_status_test_user@localhost:5432/public_status_test"`;
    await $`export POSTGRES_USE_SSL="false"`;

    api = $`npm run dev`;

    for await (const chunk of api.stdout) {
      if (chunk.includes('Ready in ')) break;
    }

    console.log('api ready');
  });
};

const getShouldStartApis = () => {
  if (process.argv.length < 4) {
    console.log('expecting the api to be up and running');
    return false;
  }

  const arg = process.argv[3].toLowerCase();

  if (arg === 'true' || arg === '1') {
    return true;
  } else if (arg === 'false' || arg === '0') {
    return false;
  } else {
    console.error(
      `Invalid boolean value for shouldStartApis: ${arg}, ignoring`,
    );
    return false;
  }
};

const run = async () => {
  await spinner('running tests', async () => {
    const shouldStartApis = getShouldStartApis();

    try {
      await resetDB();

      if (shouldStartApis) {
        await startApi();
      }

      await testInvalidTimestampPast();
      await testInvalidTimestampFuture();
      await testNotAllowedPk();
      await testSignatureInvalid();
      await testValidRequest();
      await testValidRequest2();
      await testDuplicateRequest();
      await testAggregateStatusChange();
      await testGetInvalidEventIds();
      await testGetInvalidEventTimeline();
      await testGetValidEventTimeline();
      await testGetInvalidGuardEventTimeline();
      await testGetValidGuardEventTimeline();

      await resetDB();
      await insertMockDataForPaginationTest();
      await testGetEventTimelinePagination();
      await testGetGuardEventTimelinePagination();

      console.log(chalk.bgGreen.black('All tests passed'));

      if (shouldStartApis) {
        api.kill('SIGINT');
        queryApi.kill('SIGINT');
      }
    } catch (e) {
      console.error(e);
      if (shouldStartApis) {
        api.kill('SIGINT');
        queryApi.kill('SIGINT');
      }
      process.exitCode = 1;
    }
  });
};

await run();
