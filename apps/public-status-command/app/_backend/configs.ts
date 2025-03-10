export const configs = {
  timeoutThresholdSeconds: getNumber('TIMEOUT_THRESHOLD_SECONDS') ?? 30,
  allowedPks: (process.env['ALLOWED_PKS'] ?? '').split(','),
};

function getNumber(key: string): number | undefined {
  return process.env[key] ? parseFloat(process.env[key]!) : undefined;
}
