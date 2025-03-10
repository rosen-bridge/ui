#!/usr/bin/env zx
// c && zx --install public-status-test.mjs
import { blake2b } from '@noble/hashes/blake2b';
import assert from 'assert';
import axios from 'axios';
import pkg from 'secp256k1';

// TODO: use other query routes in expects too

function sign(secret, message) {
  const key = Uint8Array.from(Buffer.from(secret, 'hex'));
  const bytes = blake2b(message, {
    dkLen: 32,
  });
  const signed = pkg.ecdsaSign(bytes, key);
  return Buffer.from(signed.signature).toString('hex');
}

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

function getTime() {
  return Math.floor(Date.now() / 1000);
}

async function submitStatus(params) {
  const { timestamp, eventId, status, txId, txType, txStatus, guard } = params;

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

  const signature = sign(
    secret,
    // TODO: extract
    `${eventId}${status}${txId ?? ''}${txType ?? ''}${txStatus ?? ''}${timestamp}`,
  );

  return axios.post(`${commandApiBaseUrl}/api/status`, {
    date: timestamp,
    eventId,
    status,
    txId,
    txType,
    txStatus,
    pk,
    signature,
  });
}

async function testInvalidTimestampPast() {
  try {
    const response = await submitStatus({
      timestamp: getTime() - 30,
      eventId: id0,
      status: 'completed',
      txId: id0,
      txType: 'payment',
      txStatus: 'signed',
      guard: 0,
    });

    assert.equal(response.status, 403);
  } catch (error) {
    assert.equal(error.response.status, 403);

    if (error.response.data !== 'bad_timestamp') {
      throw new Error('testInvalidTimestampPast: Failed');
    }
  }

  console.log('testInvalidTimestampPast: Passed');
}

async function testInvalidTimestampFuture() {
  try {
    const response = await submitStatus({
      timestamp: getTime() + 1,
      eventId: id0,
      status: 'completed',
      txId: id0,
      txType: 'payment',
      txStatus: 'signed',
      guard: 0,
    });

    assert.equal(response.status, 403);
  } catch (error) {
    assert.equal(error.response.status, 403);

    if (error.response.data !== 'bad_timestamp') {
      throw new Error('testInvalidTimestampFuture: Failed');
    }
  }

  console.log('testInvalidTimestampFuture: Passed');
}

async function testNotAllowedPk() {
  try {
    const response = await submitStatus({
      timestamp: getTime(),
      eventId: id0,
      status: 'completed',
      txId: id0,
      txType: 'payment',
      txStatus: 'signed',
      guard: 2,
    });

    assert.equal(response.status, 403);
  } catch (error) {
    assert.equal(error.response.status, 403);

    if (error.response.data !== 'access_denied') {
      throw new Error('testNotAllowedPk: Failed');
    }
  }

  console.log('testNotAllowedPk: Passed');
}

async function testSignatureInvalid() {
  const temp = guardSecret0;
  guardSecret0 = guardSecret1;

  try {
    const response = await submitStatus({
      timestamp: getTime(),
      eventId: id0,
      status: 'completed',
      txId: id0,
      txType: 'payment',
      txStatus: 'signed',
      guard: 0,
    });

    assert.equal(response.status, 403);
  } catch (error) {
    assert.equal(error.response.status, 403);

    if (error.response.data !== 'verify_failed') {
      throw new Error('testSignatureInvalid: Failed');
    }
  }

  guardSecret0 = temp;

  console.log('testSignatureInvalid: Passed');
}

async function testValidRequest() {
  const timestamp = getTime();
  const eventId = id0;

  let response = await submitStatus({
    timestamp,
    eventId,
    status: 'completed',
    txId: id0,
    txType: 'payment',
    txStatus: 'signed',
    guard: 0,
  });
  assert.equal(response.status, 200);

  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  assert.equal(response.data[eventId] !== undefined, true);
  assert(response.data[eventId].updatedAt >= timestamp);
  assert.equal(response.data[eventId].status, 'waiting-for-confirmation');
  assert.equal(response.data[eventId].txId, undefined);
  assert.equal(response.data[eventId].txStatus, 'waiting-for-confirmation');

  console.log(`testValidRequest: Passed`);
}

async function testValidRequest2() {
  const timestamp = getTime() - 20;
  const eventId = id1;

  let response = await submitStatus({
    timestamp,
    eventId,
    status: 'pending-payment',
    txId: id1,
    txType: 'payment',
    txStatus: 'signed',
    guard: 1,
  });
  assert.equal(response.status, 200);

  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  assert.equal(response.data[eventId] !== undefined, true);
  assert(response.data[eventId].updatedAt >= timestamp);
  assert.equal(response.data[eventId].status, 'waiting-for-confirmation');
  assert.equal(response.data[eventId].txId, undefined);
  assert.equal(response.data[eventId].txStatus, 'waiting-for-confirmation');

  console.log(`testValidRequest2: Passed`);
}

async function testDuplicateRequest() {
  await new Promise((r) => setTimeout(r, 1000));
  const timestamp = getTime();
  const eventId = id1;

  for (let i = 0; i < 10; i += 1) {
    const response = await submitStatus({
      timestamp: getTime(),
      eventId,
      status: 'pending-payment',
      txId: id1,
      txType: 'payment',
      txStatus: 'signed',
      guard: 1,
    });
    assert.equal(response.status, 200);
  }

  const response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  assert.equal(response.data[eventId] !== undefined, true);
  assert(response.data[eventId].updatedAt < timestamp); // <
  assert.equal(response.data[eventId].status, 'waiting-for-confirmation');
  assert.equal(response.data[eventId].txId, undefined);
  assert.equal(response.data[eventId].txStatus, 'waiting-for-confirmation');

  console.log(`testDuplicateRequest: Passed`);
}

async function testAggregateStatusChange() {
  const eventId = id2;

  // submit guard 0
  let timestamp = getTime();
  let response = await submitStatus({
    timestamp,
    eventId,
    status: 'pending-payment',
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
    guard: 0,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  let event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(response.data[eventId].updatedAt >= timestamp);
  assert.equal(event.status, 'waiting-for-confirmation');
  assert.equal(event.txId, undefined);
  assert.equal(event.txStatus, 'waiting-for-confirmation');

  // submit guard 1
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    timestamp,
    eventId,
    status: 'pending-payment',
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
    guard: 1,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(event.updatedAt < timestamp);
  assert.equal(event.status, 'waiting-for-confirmation');
  assert.equal(event.txId, undefined);
  assert.equal(event.txStatus, 'waiting-for-confirmation');

  // submit guard 3
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    timestamp,
    eventId,
    status: 'pending-payment',
    txId: undefined,
    txType: undefined,
    txStatus: undefined,
    guard: 3,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(event.updatedAt >= timestamp);
  assert.equal(event.status, 'pending-payment');
  assert.equal(event.txId, undefined);
  assert.equal(event.txStatus, 'waiting-for-confirmation');

  ////////////////////////////////////////////////////////////////////

  // submit guard 0
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    timestamp,
    eventId,
    status: 'in-reward',
    txId: id0,
    txType: 'reward',
    txStatus: 'signed',
    guard: 0,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(event.updatedAt >= timestamp);
  assert.equal(event.status, 'waiting-for-confirmation');
  assert.equal(event.txId, undefined);
  assert.equal(event.txStatus, 'waiting-for-confirmation');

  // submit guard 1
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    timestamp,
    eventId,
    status: 'in-reward',
    txId: id0,
    txType: 'reward',
    txStatus: 'signed',
    guard: 1,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(event.updatedAt < timestamp);
  assert.equal(event.status, 'waiting-for-confirmation');
  assert.equal(event.txId, undefined);
  assert.equal(event.txStatus, 'waiting-for-confirmation');

  // submit guard 3
  await sleep(1000);
  timestamp = getTime();
  response = await submitStatus({
    timestamp,
    eventId,
    status: 'in-reward',
    txId: id0,
    txType: 'reward',
    txStatus: 'signed',
    guard: 3,
  });
  assert.equal(response.status, 200);

  // get
  response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [eventId],
  });
  assert.equal(response.status, 200);
  event = response.data[eventId];
  assert.equal(event !== undefined, true);
  assert(event.updatedAt >= timestamp);
  assert.equal(event.status, 'in-reward');
  assert.equal(event.txId, id0);
  assert.equal(event.txStatus, 'signed');

  console.log(`testAggregateStatusChange: Passed`);
}

async function testGetInvalidEventIds() {
  const response = await axios.post(`${queryApiBaseUrl}/api/status`, {
    eventIds: [id3],
  });
  assert.equal(response.status, 200);
  assert.equal(Object.keys(response.data).length, 0);

  console.log(`testGetInvalidEventIds: Passed`);
}

async function testGetInvalidEventTimeline() {
  const response = await axios.get(`${queryApiBaseUrl}/api/status/${id3}`);
  assert.equal(response.status, 200);
  assert.equal(response.data.length, 0);

  console.log(`testGetInvalidEventTimeline: Passed`);
}

async function testGetValidEventTimeline() {
  const response = await axios.get(`${queryApiBaseUrl}/api/status/${id1}`);
  assert.equal(response.status, 200);
  assert.equal(response.data.length, 1);
  // TODO: assert record

  console.log(`testGetValidEventTimeline: Passed`);
}

async function testGetInvalidGuardEventTimeline() {
  const response = await axios.post(
    `${queryApiBaseUrl}/api/status/${id3}/guards`,
    {
      guardPks: [guardPk0],
    },
  );
  assert.equal(response.status, 200);
  assert.equal(response.data.length, 0);

  console.log(`testGetInvalidGuardEventTimeline: Passed`);
}

async function testGetValidGuardEventTimeline() {
  const response = await axios.post(
    `${queryApiBaseUrl}/api/status/${id1}/guards`,
    {
      guardPks: [guardPk1],
    },
  );
  assert.equal(response.status, 200);
  assert.equal(response.data.length, 1);
  // TODO: assert record

  console.log(`testGetValidGuardEventTimeline: Passed`);
}

function resetDB() {
  console.log('resetting db');
  const p = $`psql -p 5432 -U postgres -d public_event_status_test`.stdio(
    'pipe',
  );

  p.stdin.write('BEGIN;\n');
  p.stdin.write('TRUNCATE TABLE tx_entity RESTART IDENTITY CASCADE;\n');
  p.stdin.write('TRUNCATE TABLE aggregated_status_entity;\n');
  p.stdin.write('TRUNCATE TABLE aggregated_status_changed_entity;\n');
  p.stdin.write('TRUNCATE TABLE guard_status_changed_entity;\n');
  p.stdin.write('TRUNCATE TABLE guard_status_entity;\n');
  p.stdin.write('COMMIT;\n');

  p.stdin.end();

  console.log('done resetting db');
}

async function resetSchema() {
  await $`psql -p 5432 -U postgres -d public_event_status_test <<EOF
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO public_event_status_test_user;
  ALTER ROLE public_event_status_test_user SET search_path = public;
  EOF`;
}

async function setupDB() {
  await $`psql -p 5432 -U postgres -d postgres <<EOF
  DROP DATABASE public_event_status_test;
  CREATE DATABASE public_event_status_test;
  CREATE USER public_event_status_test_user;
  GRANT ALL PRIVILEGES ON DATABASE public_event_status_test TO public_event_status_test_user;
  \c public_event_status_test postgres;
  GRANT ALL ON SCHEMA public TO public_event_status_test_user;
  EOF`;
}

let commandApi;
async function startCommandApi() {
  await within(async () => {
    console.log('starting command api');

    await $`export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use;`;

    cd(`apps/public-status-command`);

    await $`export ALLOWED_PKS="0308b553ecd6c7fa3098c9d129150de25eff1bb52e25223980c9e304c566f5a8e1,03a9d7dacdd1da2514188921cea39750035468dc1c7d4c23401231706c6027f5c6,03a0fd33438b413ddd0781260901817615aab9e3933a102320f1f606a35b8ed099"`;
    await $`export POSTGRES_URL="postgresql://public_event_status_test_user@localhost:5432/public_event_status_test"`;
    await $`export POSTGRES_USE_SSL="false"`;

    commandApi = $`npm run dev`;

    for await (const chunk of commandApi.stdout) {
      if (chunk.includes('Ready in ')) break;
    }

    console.log('command api ready');
  });
}

let queryApi;
async function startQueryApi() {
  await within(async () => {
    console.log('starting query api');

    await $`export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use;`;

    cd(`../public-status-query`);

    await $`export POSTGRES_URL="postgresql://public_event_status_test_user@localhost:5432/public_event_status_test"`;
    await $`export POSTGRES_USE_SSL="false"`;

    queryApi = $`npm run dev`;

    for await (const chunk of queryApi.stdout) {
      if (chunk.includes('Ready in ')) break;
    }

    console.log('query api ready');
  });
}

async function run() {
  await spinner('running tests', async () => {
    try {
      resetDB();

      // await startCommandApi();
      // await startQueryApi();

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

      // commandApi.kill('SIGINT');
      // queryApi.kill('SIGINT');
    } catch (e) {
      console.error(e);
      // commandApi.kill('SIGINT');
      // queryApi.kill('SIGINT');
      process.exitCode = 1;
    }
  });
}

await run();
