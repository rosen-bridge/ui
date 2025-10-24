import {
  Amount,
  Box,
  Card,
  CardBody,
  Connector,
  GridContainer,
  Label,
  Network,
  Stack,
  Token,
} from '@rosen-bridge/ui-kit';

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
          active={item.id === current?.id}
          clickable
          onClick={() => {
            setCurrent(item);
          }}
        >
          <CardBody>
            <Stack direction="row" justify="between" style={{ maxWidth: 600 }}>
              <Token loading={isLoading} name={item.name} />
              <div style={{ fontSize: '0.75rem' }}>
                <Connector
                  start={
                    <Network
                      loading={isLoading}
                      name={item.chain}
                      variant="logo"
                    />
                  }
                  end={<div />}
                  variant="filled"
                />
              </div>
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
