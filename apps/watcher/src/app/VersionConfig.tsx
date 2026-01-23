import { useMemo } from 'react';

import { FileAlt, Swatchbook, ShieldCheck } from '@rosen-bridge/icons';
import { AppInfo } from '@rosen-bridge/ui-kit';

import { useInfo } from '@/hooks';

import packageJson from '../../package.json';

export const VersionConfig = () => {
  const { data: info, isLoading } = useInfo();

  const versions = useMemo(() => {
    const result = [
      {
        label: 'Watcher',
        value: info?.versions.app,
        icon: <ShieldCheck />,
      },
      {
        label: 'UI',
        value: packageJson.version,
        icon: <Swatchbook />,
      },
      {
        label: 'Contract',
        value: info?.versions.contract,
        icon: <FileAlt />,
      },
    ];
    return result;
  }, [info]);

  return <AppInfo versions={versions} loading={isLoading} />;
};
