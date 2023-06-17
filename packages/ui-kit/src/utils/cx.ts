/**
 * this function takes class names as input parameters and
 * removes the invalid class names and returns an string composed of
 * passed class names.
 *
 * @param {string} - class names
 */
export const cx = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
