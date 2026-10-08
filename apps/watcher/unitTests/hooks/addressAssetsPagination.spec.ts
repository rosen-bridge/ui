import { describe, expect, it } from 'vitest';

import type { TokenInfo } from '@rosen-ui/types';

import {
  ADDRESS_ASSETS_PAGE_SIZE,
  flattenAddressAssetsPages,
  getAddressAssetsPageKey,
  hasFetchedAllAddressAssets,
} from '@/hooks/addressAssetsPagination';
import type { ApiAddressAssetsResponse } from '@/types/api';

const makeToken = (index: number): TokenInfo => ({
  tokenId: `token-${index}`,
  amount: index + 1,
  decimals: 0,
  isNativeToken: false,
});

const makePage = (start: number, count: number, total: number): ApiAddressAssetsResponse => ({
  items: Array.from({ length: count }, (_, i) => makeToken(start + i)),
  total,
});

/**
 * simulate the watcher `/address/assets` endpoint: it slices the full
 * token list by offset/limit and reports the full count as `total`
 */
const makeServer = (total: number) => {
  const all = Array.from({ length: total }, (_, i) => makeToken(i));
  return (offset: number, limit: number): ApiAddressAssetsResponse => ({
    items: all.slice(offset, offset + limit),
    total,
  });
};

/**
 * walk page keys exactly like `useSWRInfinite` does: keep asking for the
 * next key, feeding each response back as `previousPageData`, until the
 * key getter returns null
 */
const walkAllPages = (total: number) => {
  const server = makeServer(total);
  const pages: ApiAddressAssetsResponse[] = [];
  const offsets: number[] = [];
  let previous: ApiAddressAssetsResponse | null = null;
  for (let pageIndex = 0; ; pageIndex++) {
    const key = getAddressAssetsPageKey(pageIndex, previous);
    if (!key) break;
    offsets.push(key[1].offset);
    previous = server(key[1].offset, key[1].limit);
    pages.push(previous);
  }
  return { pages, offsets };
};

describe('getAddressAssetsPageKey', () => {
  /**
   * @target getAddressAssetsPageKey should return the first page key with
   * offset 0 and the page size as limit when no previous page exists
   * @scenario no previous page data is provided
   * @expected
   * - the key should target '/address/assets'
   * - offset should be 0 and limit should be the page size
   */
  it('should return the first page key when no previous page exists', () => {
    expect(getAddressAssetsPageKey(0, null)).toEqual([
      '/address/assets',
      { offset: 0, limit: ADDRESS_ASSETS_PAGE_SIZE },
    ]);
  });

  /**
   * @target getAddressAssetsPageKey should stop after a partial page
   * @scenario the previous page returned fewer items than the page size
   * @expected the next key should be null, ending the walk
   */
  it('should return null after a partial page', () => {
    const partial = makePage(0, ADDRESS_ASSETS_PAGE_SIZE - 1, 100);
    expect(getAddressAssetsPageKey(1, partial)).toBeNull();
  });

  /**
   * @target getAddressAssetsPageKey should stop when the fetched pages
   * already cover the reported total, without an extra empty request
   * @scenario two full pages cover a total that is an exact multiple of
   * the page size
   * @expected the next key should be null
   */
  it('should return null when full pages already cover the total', () => {
    const secondPage = makePage(
      ADDRESS_ASSETS_PAGE_SIZE,
      ADDRESS_ASSETS_PAGE_SIZE,
      2 * ADDRESS_ASSETS_PAGE_SIZE,
    );
    expect(getAddressAssetsPageKey(2, secondPage)).toBeNull();
  });
});

describe('walking all pages of /address/assets', () => {
  /**
   * @target the page walk should fetch every token when the address holds
   * more tokens than a single page (the old withdraw form fetched only
   * the first page, i.e. the server default of one page)
   * @scenario the server reports a total larger than the page size, with
   * a partial last page
   * @expected
   * - one request should be made per page, at increasing offsets
   * - flattening the pages should yield every token exactly once, in order
   * - hasFetchedAllAddressAssets should agree the walk is complete
   */
  it('should fetch all tokens across multiple pages', () => {
    const total = 2 * ADDRESS_ASSETS_PAGE_SIZE + 5;
    const { pages, offsets } = walkAllPages(total);

    expect(offsets).toEqual([0, ADDRESS_ASSETS_PAGE_SIZE, 2 * ADDRESS_ASSETS_PAGE_SIZE]);
    const tokens = flattenAddressAssetsPages(pages);
    expect(tokens).toHaveLength(total);
    expect(tokens?.map((token) => token.tokenId)).toEqual(
      Array.from({ length: total }, (_, i) => `token-${i}`),
    );
    expect(hasFetchedAllAddressAssets(pages)).toBe(true);
  });

  /**
   * @target the page walk should make a single request when all tokens
   * fit in the first page
   * @scenario the server total is smaller than the page size
   * @expected exactly one page is fetched and the walk is complete
   */
  it('should fetch a single page when everything fits in it', () => {
    const { pages, offsets } = walkAllPages(4);

    expect(offsets).toEqual([0]);
    expect(flattenAddressAssetsPages(pages)).toHaveLength(4);
    expect(hasFetchedAllAddressAssets(pages)).toBe(true);
  });

  /**
   * @target the page walk should not loop forever on an empty address
   * @scenario the server reports a total of zero
   * @expected exactly one page is fetched and the walk is complete
   */
  it('should stop after one empty page when the address holds no tokens', () => {
    const { pages, offsets } = walkAllPages(0);

    expect(offsets).toEqual([0]);
    expect(flattenAddressAssetsPages(pages)).toEqual([]);
    expect(hasFetchedAllAddressAssets(pages)).toBe(true);
  });
});

describe('hasFetchedAllAddressAssets', () => {
  /**
   * @target hasFetchedAllAddressAssets should report false while more
   * pages remain or are still loading
   * @scenario no pages yet, a full page with a larger total, and a page
   * list with a loading hole
   * @expected false in all three cases
   */
  it('should be false while pages are missing or still loading', () => {
    expect(hasFetchedAllAddressAssets(undefined)).toBe(false);
    expect(hasFetchedAllAddressAssets([])).toBe(false);
    expect(hasFetchedAllAddressAssets([makePage(0, ADDRESS_ASSETS_PAGE_SIZE, 100)])).toBe(false);
    expect(hasFetchedAllAddressAssets([makePage(0, 4, 4), undefined])).toBe(false);
  });
});

describe('flattenAddressAssetsPages', () => {
  /**
   * @target flattenAddressAssetsPages should pass through the absence of
   * data and skip loading holes without dropping loaded items
   * @scenario undefined pages, and pages with an undefined entry
   * @expected undefined for undefined input, and only the loaded items
   * otherwise
   */
  it('should handle undefined input and loading holes', () => {
    expect(flattenAddressAssetsPages(undefined)).toBeUndefined();
    expect(
      flattenAddressAssetsPages([makePage(0, 2, 4), undefined, makePage(2, 2, 4)]),
    ).toHaveLength(4);
  });
});
