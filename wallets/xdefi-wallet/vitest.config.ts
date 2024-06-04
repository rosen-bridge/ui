import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'xdefi-wallet',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
