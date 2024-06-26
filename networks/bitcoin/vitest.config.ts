import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'bitcoin-network',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
