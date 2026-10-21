import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { getEventStatusByTriggerTxId } from '@/backend/events';

const params = z
  .object({
    id: z.hex().length(64),
  })
  .strict();

const query = z
  .object({
    triggerTxId: z.hex().length(64),
    guardPublicKey: z.hex().length(66).optional(),
  })
  .strict();

export const GET = defineRoute({
  schema: { params, query },
  handler: ({ input }) =>
    getEventStatusByTriggerTxId(
      input.params.id,
      input.query.triggerTxId,
      input.query.guardPublicKey,
    ),
});
