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

import packageJson from '../package.json';

/**
 * render sidebar log and navigaiton buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png" />
        </Link>
      }
      versions={[
        {
          title: 'UI',
          value: packageJson.version,
        },
      ]}
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
          disabled: true,
          icon: <BitcoinCircle />,
          // badge: 'Beta',
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
      onNavigate={(route) => router.push(route.path)}
    />
  );
};
