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

const commandApiBaseUrl = 'http://localhost:3000';
const queryApiBaseUrl = 'http://localhost:3001';
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

const assertObjectsMatch = (o1, o2) => {
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

  return axios.post(`${commandApiBaseUrl}/api/status`, {
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

    if (error.response.data !== 'bad_timestamp') {
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

    if (error.response.data !== 'bad_timestamp') {
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

    if (error.response.data !== 'access_denied') {
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

    if (error.response.data !== 'verify_failed') {
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [guardPk0] },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk0,
    insertedAt: response.data[0].insertedAt,
    status: 'completed',
    txStatus: mockTx0.txStatus,
    tx: getMockTxExpectation(mockTx0, eventId, response.data[0].insertedAt),
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);
  validRequest2Timestamp = response.data[eventId].updatedAt;

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [guardPk1] },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(mockTx1, eventId, response.data[0].insertedAt),
  });

  // get guard status timeline of this eventId with another guard
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [guardPk3] },
  );
  assert(response.status === 200);
  assert(response.data.length === 0);

  // get guard status timeline of this eventId with all guards
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(mockTx1, eventId, response.data[0].insertedAt),
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
  let response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp); // <

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt < timestamp); // <
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [guardPk1] },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt < timestamp); // <
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(mockTx1, eventId, response.data[0].insertedAt),
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt >= timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk0,
    insertedAt: response.data[0].insertedAt,
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assert(response.data[0].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 2);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[1], {
    guardPk: guardPk0,
    insertedAt: response.data[1].insertedAt,
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'pending-payment',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 2);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[1], {
    insertedAt: response.data[1].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 3);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk3,
    insertedAt: response.data[0].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[1], {
    guardPk: guardPk1,
    insertedAt: response.data[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[2], {
    guardPk: guardPk0,
    insertedAt: response.data[2].insertedAt,
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt >= timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 3);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[1], {
    insertedAt: response.data[1].insertedAt,
    status: 'pending-payment',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[2], {
    insertedAt: response.data[2].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 4);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assert(response.data[3].insertedAt < timestamp);
  const txTimestamp = response.data[0].insertedAt;
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk0,
    insertedAt: response.data[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[1], {
    guardPk: guardPk3,
    insertedAt: response.data[1].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[2], {
    guardPk: guardPk1,
    insertedAt: response.data[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[3], {
    guardPk: guardPk0,
    insertedAt: response.data[3].insertedAt,
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert(response.status === 200);
  assertObjectsMatch(response.data[eventId], {
    updatedAt: response.data[eventId].updatedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assert(response.data[eventId].updatedAt < timestamp);

  // get aggregated status timeline of this eventId
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 3);
  assert(response.data[0].insertedAt < timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[1], {
    insertedAt: response.data[1].insertedAt,
    status: 'pending-payment',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[2], {
    insertedAt: response.data[2].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 5);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assert(response.data[3].insertedAt < timestamp);
  assert(response.data[4].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: response.data[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[1], {
    guardPk: guardPk0,
    insertedAt: response.data[1].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[2], {
    guardPk: guardPk3,
    insertedAt: response.data[2].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[3], {
    guardPk: guardPk1,
    insertedAt: response.data[3].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[4], {
    guardPk: guardPk0,
    insertedAt: response.data[4].insertedAt,
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
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
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
  response = await axios.get(`${queryApiBaseUrl}/api/status/${eventId}`);
  assert(response.status === 200);
  assert(response.data.length === 4);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assert(response.data[3].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    insertedAt: response.data[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[1], {
    insertedAt: response.data[1].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[2], {
    insertedAt: response.data[2].insertedAt,
    status: 'pending-payment',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });
  assertObjectsMatch(response.data[3], {
    insertedAt: response.data[3].insertedAt,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  // get guard status timeline of this eventId
  response = await axios.post(
    `${queryApiBaseUrl}/api/status/${eventId}/guards`,
    { guardPks: [] },
  );
  assert(response.status === 200);
  assert(response.data.length === 6);
  assert(response.data[0].insertedAt >= timestamp);
  assert(response.data[1].insertedAt < timestamp);
  assert(response.data[2].insertedAt < timestamp);
  assert(response.data[3].insertedAt < timestamp);
  assert(response.data[4].insertedAt < timestamp);
  assert(response.data[5].insertedAt < timestamp);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk3,
    insertedAt: response.data[0].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[1], {
    guardPk: guardPk1,
    insertedAt: response.data[1].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[2], {
    guardPk: guardPk0,
    insertedAt: response.data[2].insertedAt,
    status: 'in-reward',
    txStatus: mockTx2.txStatus,
    tx: getMockTxExpectation(mockTx2, eventId, txTimestamp),
  });
  assertObjectsMatch(response.data[3], {
    guardPk: guardPk3,
    insertedAt: response.data[3].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[4], {
    guardPk: guardPk1,
    insertedAt: response.data[4].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });
  assertObjectsMatch(response.data[5], {
    guardPk: guardPk0,
    insertedAt: response.data[5].insertedAt,
    status: 'pending-payment',
    txStatus: null,
    tx: null,
  });

  console.log(`testAggregateStatusChange: Passed`);
};

const testGetInvalidEventIds = async () => {
  // get aggregated status
  const response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [id3],
  });
  assert(response.status === 200);
  assert(Object.keys(response.data).length === 0);

  console.log(`testGetInvalidEventIds: Passed`);
};

const testGetInvalidEventTimeline = async () => {
  const response = await axios.get(`${queryApiBaseUrl}/api/status/${id3}`);
  assert(response.status === 200);
  assert(response.data.length === 0);

  console.log(`testGetInvalidEventTimeline: Passed`);
};

const testGetValidEventTimeline = async () => {
  const response = await axios.get(`${queryApiBaseUrl}/api/status/${id1}`);
  assert(response.status === 200);
  assert(response.data.length === 1);
  assertObjectsMatch(response.data[0], {
    insertedAt: validRequest2Timestamp,
    status: 'waiting-for-confirmation',
    txStatus: 'waiting-for-confirmation',
    tx: null,
  });

  console.log(`testGetValidEventTimeline: Passed`);
};

const testGetInvalidGuardEventTimeline = async () => {
  const response = await axios.post(
    `${queryApiBaseUrl}/api/status/${id3}/guards`,
    {
      guardPks: [guardPk0],
    },
  );
  assert(response.status === 200);
  assert(response.data.length === 0);

  console.log(`testGetInvalidGuardEventTimeline: Passed`);
};

const testGetValidGuardEventTimeline = async () => {
  const response = await axios.post(
    `${queryApiBaseUrl}/api/status/${id1}/guards`,
    {
      guardPks: [guardPk1],
    },
  );
  assert(response.status === 200);
  assert(response.data.length === 1);
  assertObjectsMatch(response.data[0], {
    guardPk: guardPk1,
    insertedAt: validRequest2Timestamp,
    status: 'pending-payment',
    txStatus: mockTx1.txStatus,
    tx: getMockTxExpectation(mockTx1, id1, validRequest2Timestamp),
  });

  console.log(`testGetValidGuardEventTimeline: Passed`);
};

const resetDB = () => {
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

let commandApi;
const startCommandApi = async () => {
  await within(async () => {
    console.log('starting command api');

    await $`export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use;`;

    cd(`apps/public-status-command`);

    await $`export ALLOWED_PKS="0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1,03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6,03a0fd33438b413ddd0781260901817615aab9e3933a102320f1f606a35b8ed099"`;
    await $`export POSTGRES_URL="postgresql://public_status_test_user@localhost:5432/public_status_test"`;
    await $`export POSTGRES_USE_SSL="false"`;

    commandApi = $`npm run dev`;

    for await (const chunk of commandApi.stdout) {
      if (chunk.includes('Ready in ')) break;
    }

    console.log('command api ready');
  });
};

let queryApi;
const startQueryApi = async () => {
  await within(async () => {
    console.log('starting query api');

    await $`export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use;`;

    cd(`../public-status-query`);

    await $`export POSTGRES_URL="postgresql://public_status_test_user@localhost:5432/public_status_test"`;
    await $`export POSTGRES_USE_SSL="false"`;

    queryApi = $`npm run dev`;

    for await (const chunk of queryApi.stdout) {
      if (chunk.includes('Ready in ')) break;
    }

    console.log('query api ready');
  });
};

const getShouldStartApis = () => {
  if (process.argv.length < 4) {
    console.log('expecting the apis are up and running');
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
      resetDB();

      if (shouldStartApis) {
        await startCommandApi();
        await startQueryApi();
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

      console.log(chalk.bgGreen.black('All tests passed'));

      if (shouldStartApis) {
        commandApi.kill('SIGINT');
        queryApi.kill('SIGINT');
      }
    } catch (e) {
      console.error(e);
      if (shouldStartApis) {
        commandApi.kill('SIGINT');
        queryApi.kill('SIGINT');
      }
      process.exitCode = 1;
    }
  });
};

await run();
