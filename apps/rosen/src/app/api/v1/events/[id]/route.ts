import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { getEventById } from '@/backend/events';

const params = z
  .object({
    id: z.hex().length(64),
  })
  .strict();

export const GET = defineRoute({
  schema: { params },
  handler: ({ input }) => getEventById(input.params.id),
});
