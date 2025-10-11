import {
  Amount,
  Box,
  Card,
  CardBody,
  Connector,
  Identifier,
  Label,
  Network,
  Skeleton,
  Stack,
  Token,
  Typography,
} from '@rosen-bridge/ui-kit';

import { Assets as AssetType } from '@/types/api';

import { useAsset } from './useAsset';

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
  const { tokenUrl, bridged, locked } = useAsset(item);

  const handleClick = () => {
    if (onClick) onClick(item);
  };

  if (isLoading) return <Skeleton variant="rounded" height={128} />;

  return (
    <Card active={isActive} onClick={handleClick} clickable>
      <CardBody>
        <Stack direction="row" justify="between">
          <Token name={item.name} href={tokenUrl} />
          <Typography fontSize="0.75rem">
            <Connector
              start={<Network name={item.chain} variant="logo" />}
              end={<Network name={'ethereum'} variant="logo" />}
              variant="filled"
            />
          </Typography>
        </Stack>
        <Typography>
          <Identifier value={item.id} copyable />
        </Typography>
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
