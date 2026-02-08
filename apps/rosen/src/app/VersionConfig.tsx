import { useMemo } from 'react';

import { FileAlt, Swatchbook } from '@rosen-bridge/icons';
import { AppInfo } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { NetworkHeight } from '@/backend/heightNetworks';

import { CONTRACT_VERSION } from '../../configs';
import packageJson from '../../package.json';

export const VersionConfig = () => {
  const { data, isLoading } = useSWR('/v1/heights', fetcher);

  const versions = useMemo(() => {
    const result = [
      {
        label: 'UI',
        value: packageJson.version,
        icon: <Swatchbook />,
      },
      {
        label: 'Contract',
        value: CONTRACT_VERSION,
        icon: <FileAlt />,
      },
    ];
    return result;
  }, []);

  const networks: NetworkHeight[] = useMemo(() => data ?? [], [data]);

  return (
    <AppInfo versions={versions} networks={networks} loading={isLoading} />
  );
};
