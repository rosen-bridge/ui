import { serializeError } from 'serialize-error';

import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap, unwrapFromObject } = createSafeAction({
  async onError(error, traceKey, args) {
    if (typeof window === 'undefined') {
      import('@/_actions')
        .then(({ logger }) => {
          logger(traceKey, args, serializeError(error))
            .then(() => {
              console.log('Sent log to Discord successfully');
            })
            .catch((error) => {
              console.log('Failed to send log to Discord', error);
            });
        })
        .catch((error) => {
          console.log('Failed to load logger utils', error);
        });
    }
  },
});
