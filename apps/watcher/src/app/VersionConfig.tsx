import { useMemo } from 'react';

import { AppInfo, IconProps } from '@rosen-bridge/ui-kit';

import { useInfo } from '@/hooks';

import packageJson from '../../package.json';

export const VersionConfig = () => {
  const { data: info, isLoading } = useInfo();

  const versions = useMemo(() => {
    const result = [
      {
        label: 'Watcher',
        value: info?.versions.app,
        icon: 'ShieldCheck' as IconProps['name'],
      },
      {
        label: 'UI',
        value: packageJson.version,
        icon: 'Swatchbook' as IconProps['name'],
      },
      {
        label: 'Contract',
        value: info?.versions.contract,
        icon: 'FileAlt' as IconProps['name'],
      },
    ];
    return result;
  }, [info]);

  return <AppInfo versions={versions} loading={isLoading} />;
};
