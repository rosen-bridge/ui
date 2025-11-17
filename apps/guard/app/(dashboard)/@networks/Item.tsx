'use client';

import React from 'react';

import {
  Card,
  CardBody,
  Divider,
  Network,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';

import { TokenInfoWithAddress } from '@/_types/api';

import { ItemAddress } from './ItemAddress';

export type ItemProps = {
  cold?: TokenInfoWithAddress;
  hot?: TokenInfoWithAddress;
  loading?: boolean;
  network?: NetworkType;
};

export const Item = ({ cold, hot, loading, network }: ItemProps) => {
  const error = !loading && (!network || !cold || !hot);
  return (
    <Card backgroundColor="background.paper" style={{ userSelect: 'none' }}>
      <CardBody>
        <Stack align="stretch" justify="start" spacing={1}>
          {error && (
            <Typography color="error">
              Some required data is missing.
            </Typography>
          )}
          {!error && (
            <>
              <Network loading={loading} name={network} />
              <ItemAddress loading={loading} state="hot" value={hot} />
              <Divider variant="full" />
              <ItemAddress loading={loading} state="cold" value={cold} />
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
