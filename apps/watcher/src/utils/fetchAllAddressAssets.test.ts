import { describe, expect, it, vi } from 'vitest';

import type { ApiAddressAssetsResponse } from '../types/api';
import { fetchAllAddressAssets } from './fetchAllAddressAssets';

type LoadPage = Parameters<typeof fetchAllAddressAssets>[0];

const assets = (count: number): ApiAddressAssetsResponse['items'] =>
  Array.from({ length: count }, (_, index) => ({
    tokenId: `token-${index}`,
    name: `Token ${index}`,
    amount: index,
    decimals: 0,
    isNativeToken: false,
  }));

describe('fetchAllAddressAssets', () => {
  it.each([0, 1, 20, 21, 40, 45])('fetches all %i assets with no extra request', async (count) => {
    const items = assets(count);
    const loadPage = vi.fn<LoadPage>(async ([, { offset, limit }]) => ({
      total: count,
      items: items.slice(offset, offset + limit),
    }));

    await expect(fetchAllAddressAssets(loadPage)).resolves.toEqual({ total: count, items });
    expect(loadPage).toHaveBeenCalledTimes(Math.max(1, Math.ceil(count / 20)));
    for (let page = 0; page < loadPage.mock.calls.length; page++) {
      expect(loadPage).toHaveBeenNthCalledWith(page + 1, [
        '/address/assets',
        { offset: page * 20, limit: 20 },
      ]);
    }
  });

  it('advances by the returned count when the server caps page size', async () => {
    const items = assets(5);
    const loadPage = vi.fn<LoadPage>(async ([, { offset }]) => ({
      total: items.length,
      items: items.slice(offset, offset + 2),
    }));

    await expect(fetchAllAddressAssets(loadPage)).resolves.toEqual({ total: 5, items });
    expect(loadPage.mock.calls.map(([key]) => key[1].offset)).toEqual([0, 2, 4]);
  });

  it('rejects a later page failure instead of returning a partial list', async () => {
    const error = new Error('Page unavailable');
    const loadPage = vi
      .fn<LoadPage>()
      .mockResolvedValueOnce({ total: 21, items: assets(20) })
      .mockRejectedValueOnce(error);

    await expect(fetchAllAddressAssets(loadPage)).rejects.toBe(error);
    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it('rejects an empty page before the total instead of looping indefinitely', async () => {
    const loadPage = vi
      .fn<LoadPage>()
      .mockResolvedValueOnce({ total: 21, items: assets(20) })
      .mockResolvedValue({ total: 21, items: [] });

    await expect(fetchAllAddressAssets(loadPage)).rejects.toThrow('Incomplete token list');
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
