'use client';

import React from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import Status, { Status as StatusType } from '@/(dashboard)/@health/Status';
import { ApiInfoResponse } from '@/_types/api';

const Health = () => {
  const { data: info, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);
  return (
    <Status
      isLoading={isLoading}
      variant={info?.health.status.toLowerCase() as StatusType}
      details={'hi from details tooltip'}
    />
  );
};

export default Health;
