/** Validate public relay settings without loading wallet, signing or SDK modules. */
export const validateCashonizeConnectionConfig = (options: {
  projectId: unknown;
  timeoutMs: unknown;
}): { readonly projectId: string; readonly timeoutMs: number } => {
  if (typeof options.projectId !== 'string' || !/^[0-9a-f]{32}$/.test(options.projectId))
    throw new Error('Invalid WalletConnect project ID');
  const timeoutMs =
    typeof options.timeoutMs === 'string' && /^[1-9][0-9]{0,9}$/.test(options.timeoutMs)
      ? Number(options.timeoutMs)
      : options.timeoutMs;
  if (
    typeof timeoutMs !== 'number' ||
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 30000
  )
    throw new Error('Invalid BCH wallet deadline');
  return Object.freeze({ projectId: options.projectId, timeoutMs });
};
