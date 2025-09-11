import { Amount, Columns, Grid, Label } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiAssetResponse, Assets as AssetType } from '@/types';

import { LOCK_ADDRESSES } from '../../../configs';
import BridgedAssetCard, { BridgedAssetCardSkeleton } from './BridgedAssetCard';

interface AssetRowDetailsProps {
  row: AssetType;
  expanded: boolean;
}
const AssetRowDetails = ({ row, expanded }: AssetRowDetailsProps) => {
  const { data, isLoading: loading } = useSWR<ApiAssetResponse>(
    expanded ? `/v1/assets/detail/${row.id.toLowerCase()}` : null,
    fetcher,
  );

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
      <Grid container spacing={1} mb={1}>
        {!loading &&
          data &&
          data.bridged.map((item) => (
            <Grid
              item
              mobile={12}
              tablet={6}
              laptop={4}
              desktop={3}
              key={item.chain}
            >
              <BridgedAssetCard
                asset={item}
                decimals={row.significantDecimals}
              />
            </Grid>
          ))}
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Grid
              item
              mobile={12}
              tablet={6}
              laptop={4}
              desktop={3}
              key={index}
            >
              <BridgedAssetCardSkeleton />
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default AssetRowDetails;
