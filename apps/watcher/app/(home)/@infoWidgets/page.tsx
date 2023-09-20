'use client';

import Image from 'next/image';
import useSWR from 'swr';

import { LockAlt, ShieldCheck, Wallet } from '@rosen-bridge/icons';
import { Box, Grid, SvgIcon } from '@rosen-bridge/ui-kit';
import { healthStatusColorMap } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { AugmentedPalette } from '@rosen-ui/types';

import InfoWidgetCard from './InfoWidgetCard';

import useRsnToken from '@/_hooks/useRsnToken';

import { ApiInfoResponse } from '@/_types/api';

const InfoWidgets = () => {
  const { data, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

  /**
   * get allowed and total reports based on permits count and permits per event
   */
  const getAllowedAndTotalReports = () => {
    if (data) {
      return {
        total: data.permitCount.total / data.permitsPerEvent,
        allowed: data.permitCount.active / data.permitsPerEvent,
      };
    }
    return {
      total: 0n,
      allowed: 0n,
    };
  };

  /**
   * render reports widget
   */
  const renderReportsWidget = () => {
    const allowedAndTotalPermits = getAllowedAndTotalReports();

    return (
      <InfoWidgetCard
        title="Permit"
        value={`${allowedAndTotalPermits.allowed} / ${allowedAndTotalPermits.total}`}
        icon={
          <SvgIcon fontSize="large">
            <LockAlt />
          </SvgIcon>
        }
        color="info"
        isLoading={isInfoLoading}
      />
    );
  };

  return (
    <Grid container spacing={{ mobile: 1, teblet: 3 }}>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="Current Balance"
          value={data?.currentBalance.toString() ?? ''}
          unit="ERG"
          icon={
            <SvgIcon fontSize="large">
              <Wallet />
            </SvgIcon>
          }
          isLoading={isInfoLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="Network"
          value={data?.network ?? ''}
          icon={
            isInfoLoading ? (
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
          isLoading={isInfoLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        {renderReportsWidget()}
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
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
          isLoading={isInfoLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="RSN"
          value={rsnToken?.amount.toString() ?? ''}
          icon={
            <SvgIcon fontSize="large">
              {/* FIXME: Use an appropriate icon
                local:ergo/rosen-bridge/ui#64
               */}
              <ShieldCheck />
            </SvgIcon>
          }
          color="warning"
          isLoading={isRsnTokenLoading}
        />
      </Grid>
    </Grid>
  );
};

export default InfoWidgets;
