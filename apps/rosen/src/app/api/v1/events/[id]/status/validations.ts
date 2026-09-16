import type { NextRequest } from 'next/server';

import { z } from 'zod';

const ParamsSchema = z
  .object({
    id: z.string().min(1),
    triggerTxId: z.string().min(1).optional(),
    guardPublicKey: z.hex().length(66).optional(),
  })
  .strict();

export type GetEventStatusParams = z.infer<typeof ParamsSchema>;

export const validateGet = async (
  request: NextRequest,
  context: { params: Promise<GetEventStatusParams> },
) => {
  return ParamsSchema.safeParse(
    Object.assign({}, await context.params, Object.fromEntries(request.nextUrl.searchParams)),
  );
};
