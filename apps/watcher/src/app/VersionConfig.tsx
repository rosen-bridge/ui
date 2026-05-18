import { AppInfo, IconProps } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import packageJson from '../../package.json';

export const VersionConfig = () => {
  const onFetch = async () => {
    const info = await fetcher(['/info', undefined, 'get']);
    return {
      versions: [
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
      ],
    };
  };

  return <AppInfo resolver={onFetch} />;
};
