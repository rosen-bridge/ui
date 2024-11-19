'use client';

import React from 'react';
import useSWR from 'swr';

import { Box, Card, FullCard, Grid, Typography } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { AddressSkeleton } from './AddressSkeleton';
import { CopyButton } from './CopyButton';
import { QrCodeButton } from './QrCodeButton';

import { ApiInfoResponse } from '@/_types/api';

const Address = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  return (
    <FullCard title="Address">
      {isLoading ? (
        <AddressSkeleton />
      ) : (
        data && (
          <Card variant="outlined" sx={{ p: 1, mx: 1 }}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography>{data.address}</Typography>
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    m: -1,
                    ml: 'auto',
                    flexShrink: 0,
                    bgcolor: (theme) => theme.palette.divider,
                    borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CopyButton address={data.address} />
                  <QrCodeButton address={data.address} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        )
      )}
    </FullCard>
  );
};

export default Address;
