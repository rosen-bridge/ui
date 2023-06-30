import axios from 'axios';
import JSONBigInt from 'json-bigint';

/**
 * wrap `axios.post`, returning data field of response
 * @param url
 * @param params
 */
const mutator = async (url: string, { arg }: { arg: any }) => {
  const response = await axios.post(url, arg, {
    transformRequest: (data) =>
      JSONBigInt({
        useNativeBigInt: true,
        alwaysParseAsBig: true,
      }).stringify(data),
  });

  return response.data;
};

export default mutator;
