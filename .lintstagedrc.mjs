export default {
  '*': 'prettier --ignore-unknown --write',
  '*.{js,jsx,ts,tsx}': 'vitest related --run',
};
