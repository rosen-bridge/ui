import {
  Amount,
  Card,
  CardBody,
  Chip,
  GridContainer,
  Label,
  Network,
  Stack,
  Token,
} from '@rosen-bridge/ui-kit';

import type { AssetsFullData } from './getFullAssetData';

export type ViewGridProps = {
  current?: AssetsFullData;
  items: AssetsFullData[];
  isLoading: boolean;
  setCurrent: (current?: AssetsFullData) => void;
};

export const ViewGrid = ({ current, items, isLoading, setCurrent }: ViewGridProps) => {
  return (
    <GridContainer minWidth="260px" gap={1}>
      {items.map((item, index) => (
        <Card
          id={item.id}
          key={item.id || index}
          active={!isLoading && !!item?.id && item?.id === current?.id}
          clickable
          onClick={() => {
            setCurrent(item);
          }}
        >
          <CardBody>
            <Stack direction="row" justify="between" spacing={1} style={{ maxWidth: 600 }}>
              <Token loading={isLoading} value={item.id} style={{ flex: 1 }} />
              <Chip color="neutral" loading={isLoading} style={{ fontSize: '13px' }}>
                <Network value={item.chain} />
              </Chip>
            </Stack>
            <br />
            <Label label="Bridged" dense>
              <Amount loading={isLoading} value={item.bridgedAmount} />
            </Label>
            <Label label="Locked" dense style={{ marginBottom: '-8px' }}>
              <Amount loading={isLoading} value={item.lockedAmount} />
            </Label>
          </CardBody>
        </Card>
      ))}
    </GridContainer>
  );
};
