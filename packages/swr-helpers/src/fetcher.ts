import axios from 'axios';

/**
 * FIXME: Remove this in favor of a dynamic baseURL
 * local:ergo/rosen-bridge/ui#43
 */
axios.defaults.baseURL = process.env.API_BASE_URL || '/api';

/**
 * wrap `axios.get`, returning data field of response
 * @param url
 * @param params
 */
const fetcher = async (
  /**
   * TODO: remove the inline ESLint comment
   * local:ergo/rosen-bridge/ui#441
   */
  key: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [url: string, params?: Record<string, any>, method?: 'get' | 'put'] | string,
) => {
  const method = (typeof key !== 'string' && key[2]) || 'get';
  const response = await axios[method](typeof key === 'string' ? key : key[0], {
    params: typeof key === 'string' ? undefined : key[1],
    /**
     * FIXME: Transform response to handle bigint values
     * local:ergo/rosen-bridge/ui#65
     */
  });

  return response.data;
};

export default fetcher;
