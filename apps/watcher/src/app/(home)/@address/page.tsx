'use client';

import React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Identifier,
  Typography,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/types/api';

const Address = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);
  return (
    <Card style={{ minWidth: 0 }} backgroundColor="background.paper">
      <CardHeader>
        <CardTitle>
          <Typography fontWeight="700">Address</Typography>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Identifier copyable qrcode value={data?.address} loading={isLoading} />
      </CardBody>
    </Card>
  );
};

export default Address;
