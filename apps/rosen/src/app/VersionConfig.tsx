import { FileAlt, Swatchbook } from '@rosen-bridge/icons';
import { AppInfo } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import { CONTRACT_VERSION } from '../../configs';
import packageJson from '../../package.json';

export const VersionConfig = () => {
  const onFetch = async () => {
    const info = await fetcher(['/v1/heights', undefined, 'get']);

    return {
      versions: [
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
      ],
      networks: info,
    };
  };

  return <AppInfo resolver={onFetch} />;
};
