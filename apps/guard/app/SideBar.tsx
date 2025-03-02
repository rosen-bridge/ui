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
import {
  AppBar,
  AppLogo,
  NavigationBar,
  NavigationButton,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

/**
 * render sidebar log and navigation buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const routes = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <Dashboard />,
    },
    {
      label: 'Health',
      path: '/health',
      icon: <Heartbeat />,
    },
    {
      label: 'Events',
      path: '/events',
      icon: <ClipboardNotes />,
    },
    {
      label: 'History',
      path: '/history',
      icon: <History />,
    },
    {
      label: 'Assets',
      path: '/assets',
      icon: <BitcoinCircle />,
    },
    {
      label: 'Revenues',
      path: '/revenues',
      icon: <Moneybag />,
    },
  ];

  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo
            darkLogoPath="/logo-dark-desktop.png"
            lightLogoPath="/logo-light-desktop.png"
            darkLogoMobilePath="/logo-dark-mobile.png"
            lightLogoMobilePath="/logo-light-mobile.png"
          />
        </Link>
      }
      versions={<VersionConfig />}
      navigationBar={
        <NavigationBar>
          {routes.map((route) => (
            <NavigationButton
              key={route.label}
              icon={route.icon}
              isActive={pathname === route.path}
              label={route.label}
              onClick={() => router.push(route.path)}
            />
          ))}
        </NavigationBar>
      }
    />
  );
};
