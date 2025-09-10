'use client';

import React from 'react';

import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Status, StatusType } from '@/(dashboard)/@health/Status';
import { ApiInfoResponse } from '@/_types/api';

const Health = () => {
  const { data, isLoading, error } = useSWR<ApiInfoResponse>('/info', fetcher);

  return (
    <Status
      isLoading={isLoading}
      variant={(data?.health.status.toLowerCase() as StatusType) ?? 'broken'}
      details={data?.health.trialErrors.join('\n')}
    />
  );
};

export default Health;
