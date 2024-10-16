const data = {} as any;

export const cache = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  expiry: number,
): T => {
  return (async (...args) => {
    const key = args.map((arg) => arg.toString()).join('_');

    let [result, timestamp] = data[key] || [undefined, 0];

    if (Date.now() > timestamp + expiry) {
      data[key] = [(result = callback(...args)), Date.now()];
    }

    return await result;
  }) as T;
};
