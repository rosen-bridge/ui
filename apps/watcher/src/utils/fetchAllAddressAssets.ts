import type { ApiAddressAssetsResponse } from '../types/api';

const PAGE_SIZE = 20;

type FetchPage = (
  key: [url: string, params: { offset: number; limit: number }],
) => Promise<ApiAddressAssetsResponse>;

/** Fetch every asset page; a failed or inconsistent page must not expose a partial list. */
export const fetchAllAddressAssets = async (
  fetchPage: FetchPage,
): Promise<ApiAddressAssetsResponse> => {
  const items: ApiAddressAssetsResponse['items'] = [];
  const tokenIds = new Set<string>();
  let total = 0;

  do {
    const page = await fetchPage(['/address/assets', { offset: items.length, limit: PAGE_SIZE }]);

    if (!Number.isSafeInteger(page.total) || page.total < 0 || !Array.isArray(page.items)) {
      throw new Error('The asset list response is invalid. Please try again.');
    }
    if (items.length > 0 && page.total !== total) {
      throw new Error('The asset list changed while loading. Please try again.');
    }
    total = page.total;

    if (items.length + page.items.length > total || (!page.items.length && items.length < total)) {
      throw new Error('The asset list is incomplete. Please try again.');
    }
    for (const token of page.items) {
      if (typeof token.tokenId !== 'string' || tokenIds.has(token.tokenId)) {
        throw new Error('The asset list contains repeated or invalid tokens. Please try again.');
      }
      tokenIds.add(token.tokenId);
      items.push(token);
    }
  } while (items.length < total);

  return { items, total };
};
