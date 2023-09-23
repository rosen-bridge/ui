import axios from 'axios';
import JSONBigInt from 'json-bigint';

/**
 * FIXME: Remove this in favor of a dynamic baseURL
 *
 * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/43
 */
axios.defaults.baseURL = '/api';

/**
 * wrap `axios.get`, returning data field of response
 * @param url
 * @param params
 */
const fetcher = async (
  key: [url: string, params?: Record<string, any>] | string
) => {
  const response = await axios.get(typeof key === 'string' ? key : key[0], {
    params: typeof key === 'string' ? undefined : key[1],
    /**
     * FIXME: Transform response to handle bigint values
     *
     * local:ergo/rosen-bridge/ui#65
     */
  });

  return response.data;
};

export default fetcher;
