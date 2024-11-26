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

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

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
          label: 'Home',
          path: '/',
          disabled: false,
          icon: <Estate />,
        },
        {
          label: 'Health',
          path: '/health',
          disabled: false,
          icon: <Heartbeat />,
        },
        {
          label: 'Observations',
          path: '/observations',
          disabled: false,
          icon: <Newspaper />,
        },
        {
          label: 'Events',
          path: '/events',
          disabled: false,
          icon: <ClipboardNotes />,
        },
        {
          label: 'Revenues',
          path: '/revenues',
          disabled: false,
          icon: <Moneybag />,
        },
      ]}
      isActive={(route) => pathname === route.path}
      onNavigate={(route) => router.push(route.path)}
    />
  );
};
