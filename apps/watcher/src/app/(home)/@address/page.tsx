'use client';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Identifier,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { ApiInfoResponse } from '@/types/api';

const Address = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);
  return (
    <Card style={{ minWidth: 0 }}>
      <CardHeader>
        <CardTitle fontWeight="700">Address</CardTitle>
      </CardHeader>
      <CardBody>
        <Identifier copyable qrcode value={data?.address} loading={isLoading} />
      </CardBody>
    </Card>
  );
};

export default Address;
