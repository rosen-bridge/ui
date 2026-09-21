import type { NextRequest } from 'next/server';

import { z } from 'zod';

const ParamsSchema = z
  .object({
    id: z.hex().length(64),
    triggerTxId: z.hex().length(64),
  })
  .strict();

export type GetEventGuardsStatusParams = z.infer<typeof ParamsSchema>;

export const validateGet = async (
  request: NextRequest,
  context: { params: Promise<GetEventGuardsStatusParams> },
) => {
  return ParamsSchema.safeParse(
    Object.assign({}, await context.params, Object.fromEntries(request.nextUrl.searchParams)),
  );
};
