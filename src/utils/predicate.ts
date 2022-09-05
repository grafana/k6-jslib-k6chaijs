export const isFunction = (x: unknown): x is <T, R>(...xs: T[]) => R => {
  return typeof x === 'function';
};
