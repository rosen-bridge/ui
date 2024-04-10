export default {
  '*': 'prettier --ignore-unknown --write',
  '*.{js,jsx,ts,tsx}': 'npm run test:related',
};
