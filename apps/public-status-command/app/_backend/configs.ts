const getNumber = (key: string): number | undefined => {
  return process.env[key] ? parseFloat(process.env[key]!) : undefined;
};

const getString = (key: string): string => {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
};

export const configs = {
  timeoutThresholdSeconds: getNumber('TIMEOUT_THRESHOLD_SECONDS') ?? 30,
  allowedPks: (process.env['ALLOWED_PKS'] ?? '').split(','),
  postgresUrl: getString('POSTGRES_URL'),
  postgresUseSSL: getString('POSTGRES_USE_SSL') === 'true',
};
