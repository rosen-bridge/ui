'use client';

import Image from 'next/image';
import useSWR from 'swr';

import { LockAlt, ShieldCheck, Wallet } from '@rosen-bridge/icons';
import { Box, Grid, SvgIcon } from '@rosen-bridge/ui-kit';
import { healthStatusColorMap } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { AugmentedPalette } from '@rosen-ui/types';

import InfoWidgetCard from './InfoWidgetCard';

import { ApiInfoResponse } from '@/_types/api';

const InfoWidgets = () => {
  const { data, isLoading } = useSWR<ApiInfoResponse>('/info', fetcher);

  return (
    <Grid container spacing={{ mobile: 1, teblet: 3 }}>
      <Grid item mobile={6} tablet={6} laptop={3}>
        <InfoWidgetCard
          title="Current Balance"
          value={data?.currentBalance.toString() ?? ''}
          unit="ERG"
          icon={
            <SvgIcon fontSize="large">
              <Wallet />
            </SvgIcon>
          }
          isLoading={isLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop={3}>
        <InfoWidgetCard
          title="Network"
          value={data?.network ?? ''}
          icon={
            isLoading ? (
              <Box sx={{ width: 35, height: 35 }} />
            ) : (
              <Image
                src={`/chains/${data?.network ?? ''}.svg`}
                alt="network"
                width={35}
                height={35}
              />
            )
          }
          color="primary"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop={3}>
        <InfoWidgetCard
          title="Permit"
          value={data?.permitCount.toString() ?? ''}
          icon={
            <SvgIcon fontSize="large">
              <LockAlt />
            </SvgIcon>
          }
          color="info"
          isLoading={isLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop={3}>
        <InfoWidgetCard
          title="Health"
          value={data?.health ?? ''}
          icon={
            <SvgIcon fontSize="large">
              <ShieldCheck />
            </SvgIcon>
          }
          color={
            data?.health
              ? (healthStatusColorMap[data.health] as keyof AugmentedPalette)
              : 'success'
          }
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
};

export default InfoWidgets;
