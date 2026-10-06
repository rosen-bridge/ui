import { useEffect, useMemo } from 'react';

import { serializeError } from 'serialize-error';
import useSWR from 'swr';

import {
  Amount,
  Box,
  Card,
  CardBody,
  GridContainer,
  Identifier,
  Network,
  useToast,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getTokenUrl } from '@rosen-ui/utils';

import type { ApiAssetResponse } from '@/types';

import type { AssetsFullData } from './getFullAssetData';

export interface BridgedListProps {
  value: AssetsFullData;
}

export const BridgedList = ({ value }: BridgedListProps) => {
  const toast = useToast();

  const { data, isLoading, error } = useSWR<ApiAssetResponse>(
    `/v1/assets/detail/${value?.id.toLowerCase()}`,
    fetcher,
    {
      keepPreviousData: true,
      refreshInterval: 0,
    },
  );

  const items = useMemo(() => {
    if (!isLoading) return data?.bridged || [];
    return Array(2).fill({});
  }, [data, isLoading]);

  useEffect(() => {
    if (error) {
      toast.add({
        type: 'error',
        description: error.message,
        more: () => JSON.stringify(serializeError(error), null, 2),
      });
    }
  }, [error, toast.add]);

  return (
    <GridContainer minWidth="220px" gap="0.5rem">
      {items.map((item, index) => (
        <Card key={item.id ?? index} backgroundColor="neutral-light">
          <CardBody>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
              fontSize="0.875rem"
            >
              <Network loading={isLoading} value={item.chain} />
              <Amount loading={isLoading} value={item.amount} decimal={value.significantDecimals} />
            </Box>
            <Box fontSize={'0.875rem'} color="text.secondary" mb={-1}>
              <Identifier
                href={getTokenUrl(item.chain, item.birdgedTokenId)}
                loading={isLoading}
                value={item.birdgedTokenId}
              />
            </Box>
          </CardBody>
        </Card>
      ))}
    </GridContainer>
  );
};
