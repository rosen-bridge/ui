import { createSafeAction } from './safeServerAction';

export const { wrap, unwrap } = createSafeAction({
  async onError(error, traceKey, args) {},
});
