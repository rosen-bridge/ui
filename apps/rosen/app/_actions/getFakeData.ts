'use server';

let data = {} as any;

export const setFakeData = async (key: string, value: any) => {
  data[key] = value;
  return {
    key,
    value,
  };
};

export const getFakeData = async () => {
  return data;
};
