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

const split = (input: string, size: number): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
};

export const logger = async (
  traceKey: string | undefined,
  args: unknown,
  error: unknown,
) => {
  if (!process.env.DISCORD_LOGGER_WEBHOOK_URL) return;
  try {
    await fetch(process.env.DISCORD_LOGGER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: '🚨 New error captured!',
            color: 0xff0000,
            fields: [
              {
                name: '🔑 Trace Key',
                value: traceKey || 'N/A',
                inline: false,
              },
              {
                name: '🌐 Branch URL',
                value: process.env.VERCEL_BRANCH_URL
                  ? `[${process.env.VERCEL_BRANCH_URL}](https://${process.env.VERCEL_BRANCH_URL})`
                  : 'N/A',
                inline: false,
              },
              ...split(format(args), 1000).map((chunk, index) => ({
                name: index === 0 ? '📦 Arguments' : '',
                value: '```' + chunk + '```',
                inline: false,
              })),
              ...split(format(error), 1000).map((chunk, index) => ({
                name: index === 0 ? '🧠 Error' : '',
                value: '```' + chunk + '```',
                inline: false,
              })),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch {}
};
