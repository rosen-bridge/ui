import { useMemo } from 'react';

import { Version } from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

export const VersionConfig = () => {
  const { data: info, isLoading } = useInfo();

  const sub = useMemo(() => {
    const result = [
      { label: 'UI', value: packageJson.version },
      { label: 'Contract', value: info?.versions.contract },
    ];
    if (!isLoading && info?.versions.contract !== info?.versions.tokensMap) {
      result.push({ label: 'Tokens', value: info!.versions.tokensMap });
    }
    return result;
  }, [info, isLoading]);

  return <Version label="Watcher" value={info?.versions.app} sub={sub} />;
};
