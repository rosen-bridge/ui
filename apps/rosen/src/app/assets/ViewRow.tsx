import { Fragment } from 'react';

import {
  Amount,
  Columns,
  Icon,
  IconButton,
  Label,
  Network,
  Skeleton,
  TableGrid,
  TableGridBody,
  TableGridBodyDetails,
  TableGridCell,
  TableGridHeader,
  TableGridRow,
  Token,
} from '@rosen-bridge/ui-kit';

import { BridgedList } from './BridgedList';
import { AssetsFullData } from './getFullAssetData';

export type ViewRowProps = {
  current?: AssetsFullData;
  items: AssetsFullData[];
  isLoading: boolean;
  setCurrent: (current?: AssetsFullData) => void;
};

export const ViewRow = ({
  current,
  items,
  isLoading,
  setCurrent,
}: ViewRowProps) => {
  return (
    <TableGrid>
      <TableGridHeader>
        <TableGridCell>Name</TableGridCell>
        <TableGridCell>Network</TableGridCell>
        <TableGridCell skip="tablet-down">Locked</TableGridCell>
        <TableGridCell skip="desktop-down">Hot</TableGridCell>
        <TableGridCell skip="desktop-down">Cold</TableGridCell>
        <TableGridCell skip="laptop-down">Bridged</TableGridCell>
        <TableGridCell width="3.65rem" />
      </TableGridHeader>
      <TableGridBody>
        {items.map((item, index) => (
          <Fragment key={item.id || index}>
            {isLoading && (
              <Skeleton
                variant="rounded"
                height={50}
                style={{ gridColumn: '1/-1' }}
              />
            )}
            {!isLoading && (
              <TableGridRow id={item.id}>
                <TableGridCell>
                  <Token href={item.tokenUrl} value={item.id} />
                </TableGridCell>
                <TableGridCell>
                  <Network value={item.chain} />
                </TableGridCell>
                <TableGridCell skip="tablet-down">
                  <Amount value={item.lockedAmount} />
                </TableGridCell>
                <TableGridCell skip="desktop-down">
                  <Amount value={item.hotAmount} href={item.hotUrl} />
                </TableGridCell>
                <TableGridCell skip="desktop-down">
                  <Amount value={item.coldAmount} href={item.coldUrl} />
                </TableGridCell>
                <TableGridCell skip="laptop-down">
                  <Amount value={item.bridgedAmount} />
                </TableGridCell>
                <TableGridCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setCurrent(current?.id === item.id ? undefined : item);
                    }}
                  >
                    <Icon
                      name={current?.id === item.id ? 'AngleUp' : 'AngleDown'}
                    />
                  </IconButton>
                </TableGridCell>
                <TableGridBodyDetails open={current?.id === item.id}>
                  <Columns width="175px" count={2} rule gap="16px">
                    <Label
                      label="Locked"
                      orientation="horizontal"
                      rewrite={{
                        tablet: {
                          style: { display: 'none' },
                        },
                      }}
                    >
                      <Amount value={item.lockedAmount} />
                    </Label>
                    <Label
                      label="Hot"
                      orientation="horizontal"
                      rewrite={{
                        desktop: {
                          style: { display: 'none' },
                        },
                      }}
                    >
                      <Amount value={item.hotAmount} />
                    </Label>
                    <Label
                      label="Cold"
                      orientation="horizontal"
                      rewrite={{
                        desktop: {
                          style: { display: 'none' },
                        },
                      }}
                    >
                      <Amount value={item.coldAmount} />
                    </Label>
                    <Label
                      label="Bridged"
                      orientation="horizontal"
                      rewrite={{
                        laptop: {
                          style: { display: 'none' },
                        },
                      }}
                    >
                      <Amount value={item.bridgedAmount} />
                    </Label>
                  </Columns>
                  <Label label="Bridged to" />
                  {current?.id === item.id && <BridgedList value={item} />}
                </TableGridBodyDetails>
              </TableGridRow>
            )}
          </Fragment>
        ))}
      </TableGridBody>
    </TableGrid>
  );
};
