export const cx = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
