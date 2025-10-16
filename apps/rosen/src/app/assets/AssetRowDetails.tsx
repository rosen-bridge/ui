import { Amount, Columns, GridContainer, Label } from '@rosen-bridge/ui-kit';

import { Assets as AssetType } from '@/types';

import BridgedAssetCard from './BridgedAssetCard';
import { useAsset } from './useAsset';
import { useAssetDetails } from './useAssetDetails';

interface AssetRowDetailsProps {
  row: AssetType;
}

const AssetRowDetails = ({ row }: AssetRowDetailsProps) => {
  const { hot, cold, locked, bridged } = useAsset(row);
  const { bridgedAssets, isLoading } = useAssetDetails(row.id);

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
          <Amount value={locked} />
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
          <Amount value={hot} />
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
          <Amount value={cold} />
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
          <Amount value={bridged} />
        </Label>
      </Columns>
      <Label label="Bridged to" />
      <GridContainer minWidth="220px" gap="0.5rem">
        {bridgedAssets.map((asset, index) => (
          <BridgedAssetCard
            asset={asset}
            decimals={row.significantDecimals}
            isLoading={isLoading}
            key={index}
          />
        ))}
      </GridContainer>
    </>
  );
};

export default AssetRowDetails;
