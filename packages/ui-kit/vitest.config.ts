import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Next.js leaves JSX intact; use the same automatic runtime in consumer tests.
  esbuild: { jsx: 'automatic' },
});
