import { useMemo } from 'react';

import {
  Amount,
  Box,
  Card,
  CardBody,
  GridContainer,
  Identifier,
  Network,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getTokenUrl } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAssetResponse } from '@/types';

import { AssetsFullData } from './getFullAssetData';

export interface BridgedListProps {
  value: AssetsFullData;
}

export const BridgedList = ({ value }: BridgedListProps) => {
  const { data, isLoading } = useSWR<ApiAssetResponse>(
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

  return (
    <GridContainer minWidth="220px" gap="0.5rem">
      {items.map((item, index) => (
        <Card key={item.id ?? index} backgroundColor="neutral.light">
          <CardBody>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
              fontSize="0.875rem"
            >
              <Network loading={isLoading} name={item.chain} />
              <Amount
                loading={isLoading}
                value={item.amount}
                decimal={value.significantDecimals}
              />
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
