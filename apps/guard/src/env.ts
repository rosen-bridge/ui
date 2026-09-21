import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod/v4-mini';

const booleanFromString = z.pipe(
  z.optional(z.string()),
  z.transform((value) => value === 'true'),
);

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    API_BASE_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_USE_MOCKED_APIS: booleanFromString,
  },
  runtimeEnv: {
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_USE_MOCKED_APIS: process.env.NEXT_PUBLIC_USE_MOCKED_APIS,
  },
});
