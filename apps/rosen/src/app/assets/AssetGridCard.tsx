import {
  Amount,
  AvatarGroup,
  Box,
  Card,
  CardBody,
  Connector,
  Label,
  Network,
  Skeleton,
  Stack,
  Token,
  Typography,
} from '@rosen-bridge/ui-kit';

import { Assets as AssetType } from '@/types/api';

import { useAsset } from './useAsset';
import { useAssetDetails } from './useAssetDetails';

interface AssetRowProps {
  item: AssetType;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: (item: AssetType) => void;
}

const AssetGridCard = ({
  item,
  isLoading,
  isActive,
  onClick,
}: AssetRowProps) => {
  const { bridged, locked } = useAsset(item);
  const { bridgedAssets, isLoading: bridgedAssetsLoading } = useAssetDetails(
    item.id,
    1,
  );

  const handleClick = () => {
    if (onClick) onClick(item);
  };

  if (isLoading) return <Skeleton variant="rounded" height={128} />;

  return (
    <Card active={isActive} onClick={handleClick} clickable>
      <CardBody>
        <Stack direction="row" justify="between" style={{ maxWidth: 600 }}>
          <Token name={item.name} />
          <Typography fontSize="0.75rem">
            <Connector
              start={<Network name={item.chain} variant="logo" />}
              end={
                <AvatarGroup>
                  {bridgedAssets.map((asset) => (
                    <Network
                      name={asset.chain}
                      variant="logo"
                      loading={bridgedAssetsLoading}
                      key={asset.chain}
                    />
                  ))}
                </AvatarGroup>
              }
              variant="filled"
            />
          </Typography>
        </Stack>
        <Box mt={1} mb={-1}>
          <Label label="Bridged" dense>
            <Amount value={bridged} />
          </Label>
          <Label label="Locked" dense>
            <Amount value={locked} />
          </Label>
        </Box>
      </CardBody>
    </Card>
  );
};

export default AssetGridCard;
