import axios from 'axios';
import JSONBigInt from 'json-bigint';

/**
 * wrap `axios.post`, returning data field of response
 * @param url
 * @param params
 */
/**
 * TODO: remove the inline ESLint comment
 * local:ergo/rosen-bridge/ui#441
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mutator = async (url: string, { arg }: { arg: any }) => {
  const response = await axios.post(url, arg, {
    transformRequest: (data) =>
      JSONBigInt({
        useNativeBigInt: true,
        alwaysParseAsBig: true,
      }).stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
};

export default mutator;

/**
 * wrap `axios.post`, returning data field of response
 * it takes the headers as argument and send theme with the response
 *
 * @param url
 * @param params
 */

export interface MutatorWithHeadersArgs<Data> {
  data: Data;
  headers: {
    [headerKey: string]: string | number;
  };
}

export const mutatorWithHeaders = async <Data>(
  url: string,
  { arg }: { arg: MutatorWithHeadersArgs<Data> },
) => {
  const response = await axios.post(url, arg.data, {
    transformRequest: (data) =>
      JSONBigInt({
        useNativeBigInt: true,
        alwaysParseAsBig: true,
      }).stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...(arg.headers || {}),
    },
  });

  return response.data;
};
