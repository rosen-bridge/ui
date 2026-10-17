import type { TokenInfo } from '@rosen-ui/types';

import type { ApiAddressAssetsResponse } from '@/types/api';

/**
 * number of assets requested per `/address/assets` page; it matches the
 * default page size of the watcher service, but is sent explicitly so the
 * pagination below does not silently depend on the server default
 */
export const ADDRESS_ASSETS_PAGE_SIZE = 20;

export type AddressAssetsPageKey = ['/address/assets', { offset: number; limit: number }];

/**
 * build the SWR key for one page of `/address/assets`, in the form
 * expected by `useSWRInfinite`: returning null stops the pagination, so
 * no further page is requested.
 *
 * the walk stops when the previous page was partial (fewer items than the
 * page size, which only happens for the last page) or when the pages
 * fetched so far already cover the `total` reported by the api — the
 * latter also covers a total that is an exact multiple of the page size,
 * which would otherwise cost one extra request that returns an empty
 * page. computing the already-fetched count as `pageIndex * pageSize`
 * relies on every earlier page being full, which holds because a partial
 * page would have stopped the walk before this call.
 *
 * @param pageIndex index of the page to build the key for
 * @param previousPageData response of the previous page, or null for the
 * first page
 */
export const getAddressAssetsPageKey = (
  pageIndex: number,
  previousPageData: ApiAddressAssetsResponse | null,
): AddressAssetsPageKey | null => {
  if (previousPageData) {
    const fetchedCount = pageIndex * ADDRESS_ASSETS_PAGE_SIZE;
    if (
      previousPageData.items.length < ADDRESS_ASSETS_PAGE_SIZE ||
      fetchedCount >= previousPageData.total
    ) {
      return null;
    }
  }
  return [
    '/address/assets',
    {
      offset: pageIndex * ADDRESS_ASSETS_PAGE_SIZE,
      limit: ADDRESS_ASSETS_PAGE_SIZE,
    },
  ];
};

/**
 * flatten the fetched pages of `/address/assets` into a single token
 * list, in page order; pages that are still loading (undefined entries)
 * contribute no items yet
 *
 * @param pages the pages fetched so far, or undefined before the first
 * response arrives
 */
export const flattenAddressAssetsPages = (
  pages: (ApiAddressAssetsResponse | undefined)[] | undefined,
): TokenInfo[] | undefined => {
  if (!pages) {
    return undefined;
  }
  return pages.flatMap((page) => page?.items ?? []);
};

/**
 * check whether the fetched pages already contain every asset reported
 * by the api, i.e. the pagination walk is complete; it is false while
 * any page is still loading, and also when the last fetched page is full
 * and the accumulated items are still fewer than the reported total
 *
 * @param pages the pages fetched so far, or undefined before the first
 * response arrives
 */
export const hasFetchedAllAddressAssets = (
  pages: (ApiAddressAssetsResponse | undefined)[] | undefined,
): boolean => {
  if (!pages || pages.length === 0 || pages.some((page) => !page)) {
    return false;
  }
  const fetchedPages = pages as ApiAddressAssetsResponse[];
  const lastPage = fetchedPages[fetchedPages.length - 1];
  const fetchedCount = fetchedPages.reduce((sum, page) => sum + page.items.length, 0);
  return lastPage.items.length < ADDRESS_ASSETS_PAGE_SIZE || fetchedCount >= lastPage.total;
};
