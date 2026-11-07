import { fetcher } from '@rosen-ui/swr-helpers';

import type { ApiAddressValidateResponse } from '@/types/api';

const getResponseStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: unknown }).response;
  if (typeof response !== 'object' || response === null || !('status' in response)) {
    return undefined;
  }

  const status = (response as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
};

/**
 * Validate an Ergo withdrawal address via the Watcher `/address/validate/:address` API
 *
 * @param value - Raw address input value from the withdrawal form
 */
export const validateAddress = async (value: string): Promise<true | string> => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Address is required';
  }

  try {
    const response: ApiAddressValidateResponse = await fetcher(
      `/address/validate/${encodeURIComponent(trimmed)}`,
    );

    return response?.valid ? true : 'Invalid Address';
  } catch (error) {
    const status = getResponseStatus(error);
    if (status === 400 || status === 500) {
      return 'Invalid Address';
    }

    return 'Something went wrong! please try again';
  }
};
