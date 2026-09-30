import type { ApiAddressAssetsResponse } from '../types/api';

type LoadPage = (
  key: [string, { offset: number; limit: number }],
) => Promise<ApiAddressAssetsResponse>;

/** Fetch the complete token list without exposing a partial page to the form. */
export const fetchAllAddressAssets = async (
  loadPage: LoadPage,
): Promise<ApiAddressAssetsResponse> => {
  const items: ApiAddressAssetsResponse['items'] = [];
  let total: number;

  do {
    const page = await loadPage(['/address/assets', { offset: items.length, limit: 20 }]);
    total = page.total;
    if (page.items.length === 0 && items.length < total) {
      throw new Error('Incomplete token list');
    }
    items.push(...page.items);
  } while (items.length < total);

  return { items, total };
};
