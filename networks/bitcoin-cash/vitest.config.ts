export default {
  test: {
    include: ['tests/**/*.spec.ts'],
    coverage: { provider: 'istanbul', include: ['src/**/*.ts'] },
  },
};
