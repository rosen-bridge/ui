import * as Sentry from '@sentry/nextjs';
import { serializeError } from 'serialize-error';

import { InsufficientAssetsError } from '@rosen-network/base/dist/handleUncoveredAssets';

import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap, unwrapFromObject } = createSafeAction({
  errors: {
    InsufficientAssetsError,
  },
  serializeError(error) {
    const fallback = { 
      name: 'Error', 
      message: 'Unknown server error'
    };
    try {
      return serializeError(error, { useToJSON: false, maxDepth: 3 }) || fallback;
    } catch {
      return fallback;
    }
  },
  async onError(error, traceKey, args) {
    if (typeof window !== 'undefined') return;

    if (error instanceof InsufficientAssetsError) return;

    Sentry.withScope((scope) => {
      scope.setTag('layer', 'server-action');

      scope.setTag('action', traceKey);

      scope.setContext('safeAction', {
        traceKey,
        args: args,
      });

      scope.setLevel('error');

      Sentry.captureException(error);
    });
  },
});
