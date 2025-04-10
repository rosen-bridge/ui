import { serializeError } from 'serialize-error';

import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap } = createSafeAction({
  async onError(error, traceKey, args) {
    if (typeof window === 'undefined') {
      try {
        const { logger } = await import('@/_actions');
        await logger(traceKey, args, serializeError(error));
      } catch {}
    }
  },
});
