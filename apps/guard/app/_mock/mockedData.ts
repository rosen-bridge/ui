import { SWRConfigProps } from '@rosen-ui/swr-mock';

import { ApiInfoResponse } from '@/_types/api';

const info: ApiInfoResponse = {
  health: 'Unstable',
  hot: {
    balance: '1000',
    address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
  },
  cold: {
    balance: '10000',
    address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpX',
  },
};

const mockedData: SWRConfigProps['fakeData'] = {
  withStringKeys: {
    '/info': info,
  },
  withObjectKeys: {},
};

export default mockedData;
