import type { NextRequest } from 'next/server';

import { z } from 'zod';

const getQueryParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

type GETPositionalParams = z.infer<typeof getQueryParamsSchema>;

/**
 * validate get requests
 * @param request
 */
export const validateGet = async (
  _: NextRequest,
  context: { params: Promise<GETPositionalParams> },
) => {
  return getQueryParamsSchema.safeParse(await context.params);
};
