import axios from 'axios';
import JSONBigInt from 'json-bigint';

/**
 * wrap `axios.get`, returning data field of response
 * @param url
 */
const fetcher = async (url: string) => {
  const response = await axios.get(url, {
    transformResponse: (data) =>
      JSONBigInt({
        useNativeBigInt: true,
        alwaysParseAsBig: true,
      }).parse(data),
  });

  return response.data;
};

export default fetcher;
