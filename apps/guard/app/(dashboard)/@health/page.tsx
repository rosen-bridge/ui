'use client';

import React, { useEffect } from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Status, StatusType } from '@/(dashboard)/@health/Status';
import { ApiInfoResponse } from '@/_types/api';

const Health = () => {
  const { data, isLoading, error } = useSWR<ApiInfoResponse>('/info', fetcher);

  // useEffect(() => {
  //   console.log(data?.health);
  // }, [data]);

  return (
    <Status
      isLoading={isLoading}
      variant={(data?.health.status.toLowerCase() as StatusType) ?? 'broken'}
      details={'hi from details tooltip'}
    />
  );
};

export default Health;
