import * as Sentry from '@sentry/nextjs';
import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap } = createSafeAction({
  async onError(error, traceKey, args) {
    Sentry.withScope((scope) => {
      scope.setExtra('metadata', { traceKey, args });
      Sentry.captureException(error);
    });
  },
});
