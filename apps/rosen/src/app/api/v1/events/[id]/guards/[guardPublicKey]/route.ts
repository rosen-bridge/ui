import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { getEventGuardStatus } from '@/backend/events';

const params = z
  .object({
    id: z.hex().length(64),
    guardPublicKey: z.hex().length(66),
  })
  .strict();

const query = z
  .object({
    triggerTxId: z.hex().length(64),
  })
  .strict();

export const GET = defineRoute({
  schema: { params, query },
  handler: ({ input }) => getEventGuardStatus(input.query.triggerTxId, input.params.guardPublicKey),
});
