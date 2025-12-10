import { useMemo } from 'react';

import { FileAlt, Swatchbook, ShieldCheck } from '@rosen-bridge/icons';
import { AppInfo } from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

export const VersionConfig = () => {
  const { data: info, isLoading } = useInfo();

  const versions = useMemo(() => {
    const result = [
      {
        label: 'Guard',
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
