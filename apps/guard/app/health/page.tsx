'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';

import {
  Grid,
  HealthParamCard,
  HealthParamCardSkeleton,
  useSnackbar,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { HealthParamInfo } from '@rosen-ui/types';

import { ApiHealthStatusResponse } from '@/_types/api';

import { HEALTH_DATA_REFRESH_INTERVAL } from '@rosen-ui/constants';

const Health = () => {
  const [checking, setChecking] = useState<string[]>([]);

  const { data, isLoading, mutate } = useSWR<ApiHealthStatusResponse>(
    '/health/status',
    fetcher,
    {
      refreshInterval: HEALTH_DATA_REFRESH_INTERVAL,
    },
  );

  const { openSnackbar } = useSnackbar();

  /**
   * revalidate info of health param with id `paramId`
   *
   * @param paramId
   */
  const handleCheckNow = useCallback(
    async (paramId: string) => {
      setChecking((checking) => checking.concat(paramId));

      let newHealthParamInfo: HealthParamInfo;

      const currentHealthParamInfo: HealthParamInfo = await fetcher([
        `/health/parameter/${paramId}`,
        undefined,
        'put',
      ]);

      const trying = async () => {
        newHealthParamInfo = await fetcher(`/health/parameter/${paramId}`);

        if (
          currentHealthParamInfo.lastCheck === newHealthParamInfo.lastCheck &&
          currentHealthParamInfo.lastTrialErrorTime ===
            newHealthParamInfo.lastTrialErrorTime
        ) {
          return void setTimeout(trying, 5000);
        }

        setChecking((checking) => checking.filter((item) => item != paramId));

        const healthParamIndex = data!.findIndex(
          (healthParam) => healthParam.id === paramId,
        );
        openSnackbar(paramId + ' status updated', 'info');

        mutate([
          ...data!.slice(0, healthParamIndex),
          newHealthParamInfo,
          ...data!.slice(healthParamIndex + 1),
        ]);
      };

      await trying();
    },
    [data, mutate, openSnackbar],
  );

  return isLoading ? (
    <Grid container spacing={3}>
      <Grid item mobile={12} tablet={6} laptop={4} key={0}>
        <HealthParamCardSkeleton />
      </Grid>
      <Grid item mobile={12} tablet={6} laptop={4} key={1}>
        <HealthParamCardSkeleton />
      </Grid>
      <Grid item mobile={12} tablet={6} laptop={4} key={2}>
        <HealthParamCardSkeleton />
      </Grid>
    </Grid>
  ) : (
    data && (
      <Grid container spacing={3}>
        {data
          .sort((a, b) => (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1))
          .map((item) => (
            <Grid item mobile={12} tablet={6} laptop={4} key={item.id}>
              <HealthParamCard
                {...item}
                checking={checking.includes(item.id)}
                handleCheckNow={() => handleCheckNow(item.id)}
              />
            </Grid>
          ))}
      </Grid>
    )
  );
};

export default Health;
