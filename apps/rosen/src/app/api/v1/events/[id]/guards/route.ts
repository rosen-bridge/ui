import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { getEventGuardsStatus } from '@/backend/events';

const params = z
  .object({
    id: z.hex().length(64),
  })
  .strict();

const query = z
  .object({
    triggerTxId: z.hex().length(64),
  })
  .strict();

export const GET = defineRoute({
  schema: { params, query },
  handler: ({ input }) => getEventGuardsStatus(input.params.id, input.query.triggerTxId),
});
