import { InsufficientAssetsError } from '@rosen-network/base/dist/handleUncoveredAssets';
import { serializeError } from 'serialize-error';

import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap, unwrapFromObject } = createSafeAction({
  errors: {
    InsufficientAssetsError,
  },
  async onError(error, traceKey, args) {
    try {
      if (typeof window !== 'undefined') return;

      if (error instanceof InsufficientAssetsError) return;

      const { logger } = await import('@/actions');

      await logger(traceKey, args, serializeError(error));

      console.log('Sent log to Discord successfully');
    } catch (error) {
      console.log('Failed to send log to Discord', error);
    }
  },
});
