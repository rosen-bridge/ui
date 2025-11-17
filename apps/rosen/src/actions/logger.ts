'use server';

const format = (data: unknown): string => {
  try {
    if (data === null || data === undefined) return String(data);

    switch (typeof data) {
      case 'string':
        return data;
      case 'number':
      case 'boolean':
      case 'bigint':
      case 'symbol':
      case 'function':
        return data.toString();
    }

    if (data instanceof Error) {
      return data.stack || data.message || data.toString();
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    return JSON.stringify(
      data,
      (key, value) =>
        typeof value === 'bigint' ? `${value.toString()}n` : value,
      2,
    );
  } catch {
    return 'Unable to format data';
  }
};

export const logger = async (
  traceKey: string | undefined,
  args: unknown,
  error: unknown,
) => {
  console.error({ traceKey, args, error });

  if (!process.env.DISCORD_LOGGER_WEBHOOK_URL) return;

  try {
    const log = [
      '🚨 New error captured!',
      '',
      '🔑 Trace Key',
      traceKey || 'N/A',
      '',
      '🌐 Branch URL',
      process.env.VERCEL_BRANCH_URL
        ? `[${process.env.VERCEL_BRANCH_URL}](https://${process.env.VERCEL_BRANCH_URL})`
        : 'N/A',
      '',
      '📦 Arguments',
      format(args),
      '',
      '🧠 Error',
      format(error),
    ].join('\n');

    const formData = new FormData();

    const file = new Blob([log], { type: 'text/plain' });

    formData.append('file', file, `error-${new Date().toISOString()}.txt`);

    await fetch(process.env.DISCORD_LOGGER_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.log(error);
  }
};
