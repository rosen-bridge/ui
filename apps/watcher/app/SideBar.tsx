import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Archway,
  BitcoinCircle,
  Dashboard,
  Exchange,
  Headphones,
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
      value: info?.versions.app || '',
      important: true,
    },
    {
      title: 'UI',
      value: packageJson.version || '',
    },
    {
      title: 'Contract',
      value: info?.versions.contract || '',
    },
  ];

  if (!isLoading && info?.versions.contract !== info?.versions.tokensMap) {
    versions.push({
      title: 'Tokens',
      value: info?.versions.tokensMap || '',
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
          label: 'Bridge',
          path: '/',
          disabled: false,
          icon: <Archway />,
        },
        {
          label: 'Events',
          path: '/events',
          disabled: false,
          icon: <Exchange />,
        },
        {
          label: 'Assets',
          path: '/assets',
          disabled: false,
          icon: <BitcoinCircle />,
          badge: 'Beta',
        },
        {
          label: 'Support',
          path: '/support',
          disabled: true,
          icon: <Headphones />,
        },
        {
          label: 'Dashboard',
          path: '/dashboard',
          disabled: true,
          icon: <Dashboard />,
        },
      ]}
      isActive={(route) => pathname === route.path}
      onNavigate={(route) => router.push(route.path as any)}
    />
  );
};
