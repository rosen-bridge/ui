'use client';

import {
  ExclamationTriangle,
  LockAlt,
  ShieldCheck,
  ShieldExclamation,
  Wallet,
} from '@rosen-bridge/icons';
import * as Icons from '@rosen-bridge/icons';
import { Box } from '@rosen-bridge/ui-kit';
import { healthStatusColorMap, NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { AugmentedPalette } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';
import { upperFirst } from 'lodash-es';
import useSWR from 'swr';

import { useERsnToken } from '@/_hooks/useERsnToken';
import { useRsnToken } from '@/_hooks/useRsnToken';
import { useToken } from '@/_hooks/useToken';
import { ApiInfoResponse } from '@/_types/api';

import { InfoWidgetCard } from './InfoWidgetCard';

const InfoWidgets = () => {
  const { data, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { eRsnToken, isLoading: isERsnTokenLoading } = useERsnToken();

  let titleRSN =
    rsnToken?.amount !== undefined && rsnToken?.amount !== 0
      ? getDecimalString(rsnToken.amount.toString(), rsnToken.decimals) + ' RSN'
      : '';

  let titleERSN =
    eRsnToken?.amount !== undefined && eRsnToken?.amount !== 0
      ? getDecimalString(eRsnToken?.amount.toString(), eRsnToken.decimals) +
        ' eRSN'
      : '';

  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');

  const networkIcoName = upperFirst(
    data?.network.replace(/(^\w|-\w)/g, (match) =>
      match.replace('-', '').toUpperCase(),
    ) || '',
  );

  const NetworkIcon =
    networkIcoName in Icons
      ? Icons[networkIcoName as keyof typeof Icons]
      : ExclamationTriangle;

  const totalPermits = data
    ? Math.floor(
        (data.permitCount.total - (data.permitCount.total ? 1 : 0)) /
          data.permitsPerEvent,
      )
    : 0n;

  const allowedPermits = data
    ? Math.floor(
        (data.permitCount.active - (data.permitCount.active ? 1 : 0)) /
          data.permitsPerEvent,
      )
    : 0n;

  return (
    <Box
      style={{
        display: 'grid',
        gap: '16px',
      }}
      overrides={{
        mobile: {
          gridTemplateColumns: 'repeat(1, 1fr)',
        },
        tablet: {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        laptop: {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
        desktop: {
          gridTemplateColumns: 'repeat(6, 1fr)',
        },
      }}
    >
      <InfoWidgetCard
        title="Network"
        value={
          data?.network
            ? NETWORKS[data.network as keyof typeof NETWORKS].label
            : ''
        }
        icon={<NetworkIcon />}
        color="primary"
        isLoading={isInfoLoading}
      />
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
        icon={<LockAlt />}
        color="info"
        isLoading={isInfoLoading}
      />
      <InfoWidgetCard
        title="Available / Total Reports"
        value={`${allowedPermits} / ${totalPermits}`}
        icon={<LockAlt />}
        color="info"
        isLoading={isInfoLoading}
      />
      <InfoWidgetCard
        title="ERG"
        value={
          ergToken?.amount !== undefined
            ? getDecimalString(ergToken.amount.toString(), ergToken.decimals)
            : ''
        }
        icon={<Wallet />}
        isLoading={isErgTokenLoading}
      />
      <InfoWidgetCard
        value={titleRSN || titleERSN || '0 RSN'}
        title={rsnToken?.amount === 0 ? '' : titleERSN}
        icon={
          /**
           * FIXME: Use an appropriate icon
           * local:ergo/rosen-bridge/ui#64
           */
          <Wallet />
        }
        color="warning"
        isLoading={isRsnTokenLoading || isERsnTokenLoading}
      />
      <InfoWidgetCard
        title="Health"
        value={data?.health.status ?? ''}
        icon={
          data?.health.status === 'Healthy' ? (
            <ShieldCheck />
          ) : (
            <ShieldExclamation />
          )
        }
        color={
          data?.health
            ? (healthStatusColorMap[
                data.health.status
              ] as keyof AugmentedPalette)
            : 'success'
        }
        isLoading={isInfoLoading}
        warning={data?.health.trialErrors.join('\n')}
      />
    </Box>
  );
};

export default InfoWidgets;
