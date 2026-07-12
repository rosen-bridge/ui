'use client';

import {
  GridContainer,
  type IconProps,
  useResponsive,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import { upperFirst } from 'lodash-es';
import useSWR from 'swr';

import { useERsnToken, useRsnToken, useToken } from '@/hooks';
import type { ApiInfoResponse } from '@/types/api';

import { InfoWidgetCard, type InfoWidgetCardProps } from './InfoWidgetCard';

const healthStatusColorMap: Record<
  ApiInfoResponse['health']['status'],
  InfoWidgetCardProps['color']
> = {
  Healthy: 'success',
  Unstable: 'warning',
  Broken: 'error',
};

const InfoWidgets = () => {
  const { data, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { eRsnToken, isLoading: isERsnTokenLoading } = useERsnToken();

  const titleRSN =
    rsnToken?.amount !== undefined && rsnToken?.amount !== 0
      ? `${getDecimalString(rsnToken.amount.toString(), rsnToken.decimals)} RSN`
      : '';

  const titleERSN =
    eRsnToken?.amount !== undefined && eRsnToken?.amount !== 0
      ? `${getDecimalString(eRsnToken?.amount.toString(), eRsnToken.decimals)} eRSN`
      : '';

  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');

  const networkIcoName = upperFirst(
    data?.network.replace(/(^\w|-\w)/g, (match) =>
      match.replace('-', '').toUpperCase(),
    ) || '',
  ) as IconProps['name'];

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

  const gridContainerMinWidth = useResponsive({
    mobile: '100%',
    tablet: '35%',
    laptop: '25%',
    desktop: '15%',
  });

  return (
    <GridContainer gap={2} minWidth={gridContainerMinWidth}>
      <InfoWidgetCard
        title="Network"
        value={
          data?.network
            ? NETWORKS[data.network as keyof typeof NETWORKS].label
            : ''
        }
        icon={networkIcoName}
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
        icon="LockAlt"
        color="info"
        isLoading={isInfoLoading}
      />
      <InfoWidgetCard
        title="Available / Total Reports"
        value={`${allowedPermits} / ${totalPermits}`}
        icon="LockAlt"
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
        icon="Wallet"
        isLoading={isErgTokenLoading}
      />
      <InfoWidgetCard
        value={titleRSN || titleERSN || '0 RSN'}
        title={rsnToken?.amount === 0 ? '' : titleERSN}
        /**
         * FIXME: Use an appropriate icon
         * local:ergo/rosen-bridge/ui#64
         */
        icon="Wallet"
        color="warning"
        isLoading={isRsnTokenLoading || isERsnTokenLoading}
      />
      <InfoWidgetCard
        title="Health"
        value={data?.health.status ?? ''}
        icon={
          data?.health.status === 'Healthy'
            ? 'ShieldCheck'
            : 'ShieldExclamation'
        }
        color={
          data?.health ? healthStatusColorMap[data.health.status] : 'success'
        }
        isLoading={isInfoLoading}
        warning={data?.health.trialErrors.join('\n')}
      />
    </GridContainer>
  );
};

export default InfoWidgets;
