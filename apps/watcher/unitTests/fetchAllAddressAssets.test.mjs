import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { fetchAllAddressAssets } = require('../src/utils/fetchAllAddressAssets.ts');

const assets = (count) =>
  Array.from({ length: count }, (_, index) => ({
    tokenId: `token-${index}`,
    name: `Token ${index}`,
    amount: index,
    decimals: 0,
    isNativeToken: false,
  }));

const pagesFor = (items, pageLimit = 20) => {
  const requests = [];
  const fetchPage = async ([url, { offset, limit }]) => {
    requests.push({ url, offset, limit });
    return { total: items.length, items: items.slice(offset, offset + Math.min(limit, pageLimit)) };
  };
  return { fetchPage, requests };
};

test('an empty wallet finishes after one request', async () => {
  const { fetchPage, requests } = pagesFor([]);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 0, items: [] });
  assert.deepEqual(requests, [{ url: '/address/assets', offset: 0, limit: 20 }]);
});

test('a single short page preserves every asset including zero balances', async () => {
  const expected = assets(7);
  const { fetchPage, requests } = pagesFor(expected);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 7, items: expected });
  assert.equal(requests.length, 1);
});

test('all pages are fetched without an extra request at an exact page boundary', async () => {
  const expected = assets(40);
  const { fetchPage, requests } = pagesFor(expected);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 40, items: expected });
  assert.deepEqual(
    requests.map((request) => request.offset),
    [0, 20],
  );
});

test('assets past the second page appear in the completed result', async () => {
  const expected = assets(55);
  const { fetchPage, requests } = pagesFor(expected);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 55, items: expected });
  assert.deepEqual(
    requests.map((request) => request.offset),
    [0, 20, 40],
  );
  assert.ok(requests.every((request) => request.limit === 20));
});

test('short intermediate pages advance by returned items and do not skip assets', async () => {
  const expected = assets(25);
  const { fetchPage, requests } = pagesFor(expected, 7);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 25, items: expected });
  assert.deepEqual(
    requests.map((request) => request.offset),
    [0, 7, 14, 21],
  );
});

test('the result stays pending until the last page succeeds', async () => {
  const expected = assets(21);
  let releaseLastPage;
  let secondPageStarted;
  const pendingPage = new Promise((resolve) => {
    releaseLastPage = resolve;
  });
  const secondPage = new Promise((resolve) => {
    secondPageStarted = resolve;
  });
  const result = fetchAllAddressAssets(async ([, { offset }]) => {
    if (!offset) return { total: 21, items: expected.slice(0, 20) };
    secondPageStarted();
    return pendingPage;
  });
  let settled = false;
  result.then(() => {
    settled = true;
  });
  await secondPage;
  assert.equal(settled, false);
  releaseLastPage({ total: 21, items: expected.slice(20) });
  assert.deepEqual(await result, { total: 21, items: expected });
});

test('a failed later page rejects instead of returning the earlier assets', async () => {
  const failure = new Error('second page unavailable');
  const expected = assets(21);
  await assert.rejects(
    fetchAllAddressAssets(async ([, { offset }]) => {
      if (offset) throw failure;
      return { total: 21, items: expected.slice(0, 20) };
    }),
    (error) => error === failure,
  );
});

test('an empty page before the reported total rejects without looping', async () => {
  let calls = 0;
  await assert.rejects(
    fetchAllAddressAssets(async () => {
      calls++;
      return { total: 21, items: calls === 1 ? assets(20) : [] };
    }),
    /incomplete/,
  );
  assert.equal(calls, 2);
});

test('repeated pages cannot masquerade as a complete list', async () => {
  let calls = 0;
  await assert.rejects(
    fetchAllAddressAssets(async () => {
      calls++;
      return { total: 40, items: assets(20) };
    }),
    /repeated/,
  );
  assert.equal(calls, 2);
});

test('duplicate token IDs inside the first page are rejected', async () => {
  const [token] = assets(1);
  await assert.rejects(
    fetchAllAddressAssets(async () => ({ total: 2, items: [token, token] })),
    /repeated/,
  );
});

test('a changing reported total rejects a mixed wallet snapshot', async () => {
  for (const changedTotal of [20, 22]) {
    await assert.rejects(
      fetchAllAddressAssets(async ([, { offset }]) =>
        offset ? { total: changedTotal, items: assets(1) } : { total: 21, items: assets(20) },
      ),
      /changed while loading/,
    );
  }
});

test('invalid totals and overfull pages are rejected', async () => {
  for (const total of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    await assert.rejects(
      fetchAllAddressAssets(async () => ({ total, items: [] })),
      /invalid/,
    );
  }
  await assert.rejects(
    fetchAllAddressAssets(async () => ({ total: 1, items: assets(2) })),
    /incomplete/,
  );
});

test('a retry starts at zero and does not reuse a failed partial result', async () => {
  const expected = assets(21);
  await assert.rejects(
    fetchAllAddressAssets(async ([, { offset }]) => {
      if (offset) throw new Error('temporary failure');
      return { total: 21, items: expected.slice(0, 20) };
    }),
    /temporary failure/,
  );
  const { fetchPage, requests } = pagesFor(expected);
  assert.deepEqual(await fetchAllAddressAssets(fetchPage), { total: 21, items: expected });
  assert.equal(requests[0].offset, 0);
});
