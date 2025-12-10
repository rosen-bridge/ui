import {
  Amount,
  Box,
  Card,
  CardBody,
  Chip,
  GridContainer,
  Label,
  Stack,
  Token,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import { AssetsFullData } from './getFullAssetData';

export type ViewGridProps = {
  current?: AssetsFullData;
  items: AssetsFullData[];
  isLoading: boolean;
  setCurrent: (current?: AssetsFullData) => void;
};

export const ViewGrid = ({
  current,
  items,
  isLoading,
  setCurrent,
}: ViewGridProps) => {
  return (
    <GridContainer minWidth="260px" gap="8px">
      {items.map((item, index) => (
        <Card
          key={item.id || index}
          active={!isLoading && !!item?.id && item?.id === current?.id}
          backgroundColor="background.paper"
          clickable
          onClick={() => {
            setCurrent(item);
          }}
        >
          <CardBody>
            <Stack
              direction="row"
              justify="between"
              spacing={1}
              style={{ maxWidth: 600 }}
            >
              <Token loading={isLoading} name={item.name} style={{ flex: 1 }} />
              <Chip
                color="neutral"
                icon={item.chain?.replace(/(^\w|-\w)/g, (matched) =>
                  matched.replace('-', '').toUpperCase(),
                )}
                label={NETWORKS[item.chain].label}
                loading={isLoading}
              />
            </Stack>
            <Box mt={1} mb={-1}>
              <Label label="Bridged" dense>
                <Amount loading={isLoading} value={item.bridgedAmount} />
              </Label>
              <Label label="Locked" dense>
                <Amount loading={isLoading} value={item.lockedAmount} />
              </Label>
            </Box>
          </CardBody>
        </Card>
      ))}
    </GridContainer>
  );
};
