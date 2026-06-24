import React from 'react';

import {
  Amount,
  Icon,
  IconButton,
  Identifier,
  Label,
  Network,
  TableGrid,
  TableGridBody,
  TableGridBodyDetails,
  TableGridCell,
  TableGridHeader,
  TableGridRow,
  Token,
  useBreakpoint,
  useResponsive,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getTokenUrl } from '@rosen-ui/utils';

import { Assets } from '@/types/api';

export type ViewRowProps = {
  current?: Assets;
  items: Assets[];
  isLoading: boolean;
  setCurrent: (item: Assets) => void;
};

export const ViewRow = ({
  current,
  items,
  isLoading,
  setCurrent,
}: ViewRowProps) => {
  const isTabletUp = useBreakpoint('tablet-up');
  const isLaptopUp = useBreakpoint('laptop-up');

  const idWidth = useResponsive({
    mobile: '50%',
    tablet: '30%',
    laptop: '25%',
  });

  return (
    <TableGrid>
      <TableGridHeader>
        <TableGridCell data-width={idWidth}>Id</TableGridCell>
        {isTabletUp && <TableGridCell>Chain</TableGridCell>}
        <TableGridCell>Token</TableGridCell>
        {isLaptopUp && <TableGridCell>Hot Amount</TableGridCell>}
        {isLaptopUp && <TableGridCell>Cold Amount</TableGridCell>}
        <TableGridCell width="3.65rem" />
      </TableGridHeader>
      <TableGridBody>
        {items.map((item, index) => (
          <TableGridRow key={index}>
            <TableGridCell>
              <Identifier
                loading={isLoading}
                value={item.token?.id}
                href={getTokenUrl(
                  item.chain,
                  item.token?.id && item.chain == NETWORKS.cardano.key
                    ? item.token?.id.replace('.', '')
                    : item.token?.id,
                )}
              />
            </TableGridCell>
            {isTabletUp && (
              <TableGridCell>
                <Network loading={isLoading} value={item.chain} />
              </TableGridCell>
            )}
            <TableGridCell>
              <Token loading={isLoading} label={item.token?.name} />
            </TableGridCell>
            {isLaptopUp && (
              <TableGridCell>
                <Amount
                  loading={isLoading}
                  value={item.hot?.amount}
                  decimal={item.token?.decimals}
                  href={getAddressUrl(item.chain, item.hot?.address)}
                />
              </TableGridCell>
            )}
            {isLaptopUp && (
              <TableGridCell>
                <Amount
                  loading={isLoading}
                  value={item.cold?.amount}
                  decimal={item.token?.decimals}
                  href={getAddressUrl(item.chain, item.cold?.address)}
                />
              </TableGridCell>
            )}

            {!isLaptopUp && (
              <>
                <TableGridCell>
                  <IconButton
                    disabled={isLoading}
                    size="small"
                    onClick={() => {
                      setCurrent(item);
                    }}
                  >
                    <Icon
                      name={current?.id === item.id ? 'AngleUp' : 'AngleDown'}
                    />
                  </IconButton>
                </TableGridCell>
                <TableGridBodyDetails open={current?.id === item.id}>
                  {!isTabletUp && (
                    <Label label="Chain" orientation="horizontal">
                      <Network
                        variant="reverse"
                        loading={isLoading}
                        value={item.chain}
                      />
                    </Label>
                  )}
                  <Label label="Hot Amount" orientation="horizontal">
                    <Amount
                      loading={isLoading}
                      value={item.hot?.amount}
                      decimal={item.token?.decimals}
                      href={getAddressUrl(item.chain, item.hot?.address)}
                    />
                  </Label>
                  <Label label="Cold Amount" orientation="horizontal">
                    <Amount
                      loading={isLoading}
                      value={item.cold?.amount}
                      decimal={item.token?.decimals}
                      href={getAddressUrl(item.chain, item.cold?.address)}
                    />
                  </Label>
                </TableGridBodyDetails>
              </>
            )}
          </TableGridRow>
        ))}
      </TableGridBody>
    </TableGrid>
  );
};
