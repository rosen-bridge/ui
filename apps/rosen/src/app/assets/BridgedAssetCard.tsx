import {
  Amount,
  Box,
  Card,
  CardBody,
  Identifier,
  Network,
  Skeleton,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { ApiAssetResponse } from '@/types';

interface BridgedAssetCardProps {
  asset: ApiAssetResponse['bridged'][0];
  decimals: number;
}

export const BridgedAssetCardSkeleton = () => (
  <Skeleton variant="rounded" height={90} />
);

const BridgedAssetCard = ({ asset, decimals }: BridgedAssetCardProps) => {
  const { amount, birdgedTokenId, chain } = asset;
  const tokenUrl = getTokenUrl(
    chain,
    chain == NETWORKS.cardano.key
      ? birdgedTokenId.replace('.', '')
      : birdgedTokenId,
  );
  return (
    <Card backgroundColor="neutral.light">
      <CardBody>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          fontSize="0.875rem"
        >
          <Network name={chain} />
          <Amount value={getDecimalString(amount, decimals)} />
        </Box>
        <Box fontSize={'0.875rem'} color="text.secondary">
          <Identifier value={birdgedTokenId} href={tokenUrl || undefined} />
        </Box>
      </CardBody>
    </Card>
  );
};

export default BridgedAssetCard;
