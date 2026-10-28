'use client';

import useSWR from 'swr';

import { Text } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { ApiInfoResponse } from '@/types/api';

const LockText = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  return (
    <>
      <Text>
        You can redeem your permits and unlock your RSN tokens. If you redeem all of your permits,
        your collateral will be redeemed automatically.
      </Text>
      <Text variant="heading4" style={{ marginTop: '8px' }}>
        Caution
      </Text>
      <Text>
        You can only return your in-wallet permits. To redeem your collateral, wait for reported
        events to be settled.
        {!isInfoLoading &&
          info &&
          info?.permitCount.active !== info?.permitCount.total &&
          ` (You have ${info.permitCount.total - info.permitCount.active} pending permits)`}
      </Text>
    </>
  );
};

export default LockText;
