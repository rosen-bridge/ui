const getString = (key: string): string => {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
};

export const configs = {
  postgresUrl: getString('POSTGRES_URL'),
  postgresUseSSL: getString('POSTGRES_USE_SSL') === 'true',
};
