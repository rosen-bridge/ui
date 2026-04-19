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
  useBreakpoint,
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
  const isTabletUp = useBreakpoint('tablet-up');
  const isDesktopUp = useBreakpoint('desktop-up');
  const isLaptopUp = useBreakpoint('laptop-up');
  return (
    <TableGrid>
      <TableGridHeader>
        <TableGridCell>Name </TableGridCell>
        <TableGridCell>Network</TableGridCell>
        {isTabletUp && <TableGridCell>Locked</TableGridCell>}
        {isDesktopUp && <TableGridCell>Hot</TableGridCell>}
        {isDesktopUp && <TableGridCell>Cold</TableGridCell>}
        {isLaptopUp && <TableGridCell>Bridged</TableGridCell>}
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
                {isTabletUp && (
                  <TableGridCell>
                    <Amount value={item.lockedAmount} />
                  </TableGridCell>
                )}
                {isDesktopUp && (
                  <TableGridCell>
                    <Amount value={item.hotAmount} href={item.hotUrl} />
                  </TableGridCell>
                )}
                {isDesktopUp && (
                  <TableGridCell>
                    <Amount value={item.coldAmount} href={item.coldUrl} />
                  </TableGridCell>
                )}
                {isLaptopUp && (
                  <TableGridCell>
                    <Amount value={item.bridgedAmount} />
                  </TableGridCell>
                )}
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
                    {!isTabletUp && (
                      <Label
                        label="Locked"
                        orientation="horizontal"
                      >
                        <Amount value={item.lockedAmount} />
                      </Label>
                    )}
                    {!isDesktopUp && (
                      <Label
                        label="Hot"
                        orientation="horizontal"
                      >
                        <Amount value={item.hotAmount} />
                      </Label>
                    )}
                    {!isDesktopUp && (
                      <Label
                        label="Cold"
                        orientation="horizontal"
                      >
                        <Amount value={item.coldAmount} />
                      </Label>
                    )}
                    {isLaptopUp && (
                      <Label
                        label="Bridged"
                        orientation="horizontal"
                      >
                        <Amount value={item.bridgedAmount} />
                      </Label>
                    )}
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
