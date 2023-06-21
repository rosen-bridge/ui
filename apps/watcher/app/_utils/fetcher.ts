import axios from 'axios';
import { Fetcher } from 'swr';

import { ApiInfoResponse } from '@/_types/api';

/**
 * wrap `axios.get`, returning data field of response
 * @param url
 */
const fetcher: Fetcher<ApiInfoResponse> = (url: string) =>
  axios.get(url).then((res) => res.data);

export default fetcher;
