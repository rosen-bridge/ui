'use client';

import React from 'react';

import { Typography } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/types/api';

import { ActionText } from '../../ActionText';

const LockText = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  return (
    <ActionText title="Unlock & Redeem Permit">
      <Typography gutterBottom>
        You can redeem your permits and unlock your RSN tokens. If you redeem
        all of your permits, your collateral will be redeemed automatically.
      </Typography>
      <Typography fontWeight="bold" sx={{ mt: 2 }}>
        Caution
      </Typography>
      <Typography sx={{ mb: 2 }}>
        You can only return your in-wallet permits. To redeem your collateral,
        wait for reported events to be settled.
        {!isInfoLoading &&
          info &&
          info?.permitCount.active !== info?.permitCount.total &&
          ` (You have ${
            info.permitCount.total - info.permitCount.active
          } pending permits)`}
      </Typography>
    </ActionText>
  );
};

export default LockText;
