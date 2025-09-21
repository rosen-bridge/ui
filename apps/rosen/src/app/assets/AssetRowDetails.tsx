import { useMemo } from 'react';

import { Amount, Columns, GridContainer, Label } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAssetResponse, Assets as AssetType } from '@/types';

import { LOCK_ADDRESSES } from '../../../configs';
import BridgedAssetCard from './BridgedAssetCard';

interface AssetRowDetailsProps {
  row: AssetType;
  expanded: boolean;
}
const AssetRowDetails = ({ row, expanded }: AssetRowDetailsProps) => {
  const { data, isLoading } = useSWR<ApiAssetResponse>(
    expanded ? `/v1/assets/detail/${row.id.toLowerCase()}` : null,
    fetcher,
  );

  const items = useMemo(() => {
    if (!isLoading) return data?.bridged || [];
    return Array(4).fill({});
  }, [data, isLoading]);

  const hot = row.lockedPerAddress?.find((item) =>
    Object.values(LOCK_ADDRESSES).includes(item.address),
  );
  const cold = row.lockedPerAddress?.find(
    (item) => !Object.values(LOCK_ADDRESSES).includes(item.address),
  );

  return (
    <>
      <Columns width="175px" count={2} rule gap="16px">
        <Label
          label="Locked"
          orientation="horizontal"
          overrides={{
            tablet: {
              style: { display: 'none' },
            },
          }}
        >
          <Amount
            value={getDecimalString(
              ((hot?.amount || 0) + (cold?.amount || 0)).toString(),
              row.significantDecimals,
            )}
          />
        </Label>
        <Label
          label="Hot"
          orientation="horizontal"
          overrides={{
            desktop: {
              style: { display: 'none' },
            },
          }}
        >
          <Amount
            value={getDecimalString(
              (hot?.amount || 0).toString(),
              row.significantDecimals,
            )}
          />
        </Label>
        <Label
          label="Cold"
          orientation="horizontal"
          overrides={{
            desktop: {
              style: { display: 'none' },
            },
          }}
        >
          <Amount
            value={getDecimalString(
              (cold?.amount || 0).toString(),
              row.significantDecimals,
            )}
          />
        </Label>
        <Label
          label="Bridged"
          orientation="horizontal"
          overrides={{
            laptop: {
              style: { display: 'none' },
            },
          }}
        >
          <Amount
            value={getDecimalString(
              row.bridged || '0',
              row.significantDecimals,
            )}
          />
        </Label>
      </Columns>
      <Label label="Bridged to" />
      <GridContainer minWidth="220px" gap="0.5rem">
        {items.map((item) => (
          <BridgedAssetCard
            asset={item}
            decimals={row.significantDecimals}
            isLoading={isLoading}
            key={item.chain}
          />
        ))}
      </GridContainer>
    </>
  );
};

export default AssetRowDetails;
