import React from 'react';

import {
  Amount,
  Box,
  Card,
  CardBody,
  Chip,
  GridContainer,
  Identifier,
  Label,
  Network,
  Stack,
  Token,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getTokenUrl } from '@rosen-ui/utils';

import { Assets } from '@/types/api';

export type ViewGridProps = {
  items: Assets[];
  isLoading: boolean;
};

export const ViewGrid = ({ items, isLoading }: ViewGridProps) => {
  return (
    <GridContainer minWidth="260px" gap={1}>
      {items.map((item, index) => (
        <Card id={item.id} key={item.id || index}>
          <CardBody>
            <Stack>
              <Stack
                direction="row"
                justify="between"
                spacing={1}
                style={{ maxWidth: 600 }}
              >
                <Token loading={isLoading} label={item.token?.name} />
                <Chip
                  color="neutral"
                  loading={isLoading}
                  style={{ fontSize: '13px' }}
                >
                  <Network value={item.chain} />
                </Chip>
              </Stack>
              <Box>
                <Label label="Hot Amount" orientation="horizontal">
                  <Amount
                    variant="hot"
                    loading={isLoading}
                    value={item.hot?.amount}
                    decimal={item.token?.decimals}
                    href={getAddressUrl(item.chain, item.hot?.address)}
                  />
                </Label>
                <Label label="Cold Amount" orientation="horizontal">
                  <Amount
                    variant="cold"
                    loading={isLoading}
                    value={item.cold?.amount}
                    decimal={item.token?.decimals}
                    href={getAddressUrl(item.chain, item.cold?.address)}
                  />
                </Label>
              </Box>
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
            </Stack>
          </CardBody>
        </Card>
      ))}
    </GridContainer>
  );
};
