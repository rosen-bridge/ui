import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  BitcoinCircle,
  Dashboard,
  Heartbeat,
  History,
  Moneybag,
  ClipboardNotes,
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
      title: 'Guard',
      value: info?.versions.app as string,
      important: true,
    },
    {
      title: 'UI',
      value: packageJson.version,
    },
    {
      title: 'Contract',
      value: info?.versions.contract as string,
    },
  ];

  if (!isLoading && info!.versions.contract !== info!.versions.tokensMap) {
    versions.push({
      title: 'Tokens',
      value: info!.versions.tokensMap as string,
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
          label: 'DASHBOARD',
          path: '/',
          disabled: false,
          icon: <Dashboard />,
        },
        {
          label: 'HEALTH',
          path: '/health',
          disabled: false,
          icon: <Heartbeat />,
        },
        {
          label: 'EVENTS',
          path: '/events',
          disabled: false,
          icon: <ClipboardNotes />,
        },
        {
          label: 'HISTORY',
          path: '/history',
          disabled: false,
          icon: <History />,
        },
        {
          label: 'ASSETS',
          path: '/assets',
          disabled: false,
          icon: <BitcoinCircle />,
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
