import * as Sentry from '@sentry/nextjs';

import { InsufficientAssetsError } from '@rosen-network/base/dist/handleUncoveredAssets';

import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap, unwrapFromObject } = createSafeAction({
  errors: {
    InsufficientAssetsError,
  },
  async onError(error, traceKey, args) {
    if (typeof window !== 'undefined') return;

    if (error instanceof InsufficientAssetsError) return;

    Sentry.withScope((scope) => {
      scope.setTag('layer', 'server-action');

      scope.setTag('action', traceKey);

      const context: Record<string, unknown> = { traceKey };

      args?.forEach((arg, index) => {
        context[`arg${index}`] = arg;
      });

      scope.setContext('safeAction', context);

      scope.setLevel('error');

      Sentry.captureException(error);
    });
  },
});
