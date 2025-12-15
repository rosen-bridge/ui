'use client';

import React from 'react';

import { FullCard, Identifier } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/_types/api';

const Address = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);
  return (
    <FullCard title="Address">
      <Identifier copyable qrcode value={data?.address} loading={isLoading} />
    </FullCard>
  );
};

export default Address;
