'use client';

import { upperFirst } from 'lodash-es';
import Image from 'next/image';
import useSWR from 'swr';

import {
  LockAlt,
  ShieldCheck,
  ShieldExclamation,
  Wallet,
} from '@rosen-bridge/icons';
import { Box, Grid, SvgIcon } from '@rosen-bridge/ui-kit';
import { healthStatusColorMap } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { AugmentedPalette } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import InfoWidgetCard from './InfoWidgetCard';

import useRsnToken from '@/_hooks/useRsnToken';
import useToken from '@/_hooks/useToken';

import { ApiInfoResponse } from '@/_types/api';

const InfoWidgets = () => {
  const { data, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');

  /**
   * get allowed and total reports based on permits count and permits per event
   */
  const getAllowedAndTotalReports = () => {
    if (data) {
      return {
        total: Math.floor(
          (data.permitCount.total - (data.permitCount.total ? 1 : 0)) /
            data.permitsPerEvent,
        ),
        allowed: Math.floor(
          (data.permitCount.active - (data.permitCount.active ? 1 : 0)) /
            data.permitsPerEvent,
        ),
      };
    }
    return {
      total: 0n,
      allowed: 0n,
    };
  };

  /**
   * render locked rsn widget
   */
  const renderLockedRsnWidget = () => (
    <InfoWidgetCard
      title="Available / Total Locked RSN"
      value={
        data
          ? `${getDecimalString(
              data.permitCount.active.toString() ?? '0',
              rsnToken?.decimals ?? 0,
              1,
            )} / ${getDecimalString(
              data.permitCount.total.toString() ?? '0',
              rsnToken?.decimals ?? 0,
              1,
            )}`
          : ''
      }
      icon={
        <SvgIcon fontSize="large">
          <LockAlt />
        </SvgIcon>
      }
      color="info"
      isLoading={isInfoLoading}
    />
  );

  /**
   * render reports widget
   */
  const renderReportsWidget = () => {
    const allowedAndTotalPermits = getAllowedAndTotalReports();

    return (
      <InfoWidgetCard
        title="Available / Total Reports"
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
          title="Network"
          value={upperFirst(data?.network ?? '')}
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
        {renderLockedRsnWidget()}
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        {renderReportsWidget()}
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="ERG"
          value={
            ergToken?.amount !== undefined
              ? getDecimalString(ergToken.amount.toString(), ergToken.decimals)
              : ''
          }
          icon={
            <SvgIcon fontSize="large">
              <Wallet />
            </SvgIcon>
          }
          isLoading={isErgTokenLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="RSN"
          value={
            rsnToken?.amount !== undefined
              ? getDecimalString(rsnToken.amount.toString(), rsnToken.decimals)
              : ''
          }
          icon={
            <SvgIcon fontSize="large">
              {/* FIXME: Use an appropriate icon
                local:ergo/rosen-bridge/ui#64
               */}
              <Wallet />
            </SvgIcon>
          }
          color="warning"
          isLoading={isRsnTokenLoading}
        />
      </Grid>
      <Grid item mobile={6} tablet={6} laptop>
        <InfoWidgetCard
          title="Health"
          value={data?.health ?? ''}
          icon={
            <SvgIcon fontSize="large">
              {data?.health === 'Healthy' ? (
                <ShieldCheck />
              ) : (
                <ShieldExclamation />
              )}
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
    </Grid>
  );
};

export default InfoWidgets;
