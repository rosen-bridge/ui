import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Estate,
  Heartbeat,
  Newspaper,
  ClipboardNotes,
  Moneybag,
} from '@rosen-bridge/icons';
import { AppBar, AppLogo } from '@rosen-bridge/ui-kit';

import useInfo from './_hooks/useInfo';

import packageJson from '../package.json';

/**
 * render sidebar log and navigation buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const { data: info, isLoading } = useInfo();

  const versions = [
    {
      title: 'Watcher',
      value: info?.versions.app,
      important: true,
    },
    {
      title: 'UI',
      value: packageJson.version,
    },
    {
      title: 'Contract',
      value: info?.versions.contract,
    },
  ];

  if (!isLoading && info?.versions.contract !== info?.versions.tokensMap) {
    versions.push({
      title: 'Tokens',
      value: info!.versions.tokensMap,
    });
  }

  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png" />
        </Link>
      }
      versions={versions}
      routes={[
        {
          label: 'HOME',
          path: '/',
          disabled: false,
          icon: <Estate />,
        },
        {
          label: 'HEALTH',
          path: '/health',
          disabled: false,
          icon: <Heartbeat />,
        },
        {
          label: 'OBSERVATIONS',
          path: '/observations',
          disabled: false,
          icon: <Newspaper />,
        },
        {
          label: 'EVENTS',
          path: '/events',
          disabled: false,
          icon: <ClipboardNotes />,
        },
        {
          label: 'REVENUES',
          path: '/revenues',
          disabled: false,
          icon: <Moneybag />,
        },
      ]}
      isActive={(route) => pathname === route.path}
      onNavigate={(route) => router.push(route.path as any)}
    />
  );
};
