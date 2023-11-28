export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    import('./app/_backend/main');
  }
};
