import { useMemo } from 'react';

import { Version } from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

export const VersionConfig = () => {
  const { data: info } = useInfo();

  const sub = useMemo(() => {
    const result = [
      {
        label: 'UI',
        value: packageJson.version,
      },
      {
        label: 'Contract',
        value: info?.versions.contract,
      },
    ];
    return result;
  }, [info]);

  return <Version label="Guard" value={info?.versions.app} sub={sub} />;
};
