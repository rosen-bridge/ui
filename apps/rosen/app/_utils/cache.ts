const data = {} as any;

export const cache = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  expiry: number,
): T => {
  return (async (...args) => {
    const key = args.map((arg) => arg.toString()).join('');

    let [result, timestamp] = data[key] || [undefined, 0];

    if (Date.now() < timestamp + expiry) return result;

    result = await callback(...args);

    data[key] = [result, Date.now()];

    return result;
  }) as T;
};
