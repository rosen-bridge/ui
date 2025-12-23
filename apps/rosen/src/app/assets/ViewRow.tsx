import { Fragment } from 'react';

import { AngleDown, AngleUp } from '@rosen-bridge/icons';
import {
  Amount,
  Columns,
  IconButton,
  Label,
  Network,
  Skeleton,
  SvgIcon,
  TableGrid,
  TableGridBody,
  TableGridBodyCol,
  TableGridBodyDetails,
  TableGridBodyRow,
  TableGridHead,
  TableGridHeadCol,
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
    <TableGrid style={{ width: 'inherit' }}>
      <TableGridHead>
        <TableGridHeadCol>Name</TableGridHeadCol>
        <TableGridHeadCol>Network</TableGridHeadCol>
        <TableGridHeadCol hideOn="tablet-down">Locked</TableGridHeadCol>
        <TableGridHeadCol hideOn="desktop-down">Hot</TableGridHeadCol>
        <TableGridHeadCol hideOn="desktop-down">Cold</TableGridHeadCol>
        <TableGridHeadCol hideOn="laptop-down">Bridged</TableGridHeadCol>
        <TableGridHeadCol style={{ padding: 0 }} width="2.5rem" />
      </TableGridHead>
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
              <TableGridBodyRow>
                <TableGridBodyCol>
                  <Token href={item.tokenUrl} name={item.name} />
                </TableGridBodyCol>
                <TableGridBodyCol>
                  <Network name={item.chain} />
                </TableGridBodyCol>
                <TableGridBodyCol>
                  <Amount value={item.lockedAmount} />
                </TableGridBodyCol>
                <TableGridBodyCol>
                  <Amount value={item.hotAmount} href={item.hotUrl} />
                </TableGridBodyCol>
                <TableGridBodyCol>
                  <Amount value={item.coldAmount} href={item.coldUrl} />
                </TableGridBodyCol>
                <TableGridBodyCol>
                  <Amount value={item.bridgedAmount} />
                </TableGridBodyCol>
                <TableGridBodyCol style={{ padding: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setCurrent(current?.id === item.id ? undefined : item);
                    }}
                  >
                    <SvgIcon>
                      {current?.id === item.id ? <AngleUp /> : <AngleDown />}
                    </SvgIcon>
                  </IconButton>
                </TableGridBodyCol>
                <TableGridBodyDetails expanded={current?.id === item.id}>
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
                      <Amount value={item.lockedAmount} />
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
                      <Amount value={item.hotAmount} />
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
                      <Amount value={item.coldAmount} />
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
                      <Amount value={item.bridgedAmount} />
                    </Label>
                  </Columns>
                  <Label label="Bridged to" />
                  {current?.id === item.id && <BridgedList value={item} />}
                </TableGridBodyDetails>
              </TableGridBodyRow>
            )}
          </Fragment>
        ))}
      </TableGridBody>
    </TableGrid>
  );
};
