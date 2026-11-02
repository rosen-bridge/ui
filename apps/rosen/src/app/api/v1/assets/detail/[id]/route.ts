import { z } from 'zod';

import { defineRoute } from '@/app/api/defineRoute';
import { getAsset } from '@/backend/assets';

const params = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const GET = defineRoute({
  schema: { params },
  handler: ({ input }) => getAsset(input.params.id),
});
