import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Archway,
  BitcoinCircle,
  Dashboard,
  Exchange,
  Headphones,
} from '@rosen-bridge/icons';
import {
  AppBar,
  AppLogo,
  NavigationBar,
  NavigationButton,
  Version,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';

/**
 * render sidebar log and navigaiton buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const routes = [
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
      versions={<Version label="UI" value={packageJson.version} />}
      navigationBar={
        <NavigationBar>
          {routes.map((route) => (
            <NavigationButton
              key={route.label}
              badge={route.badge}
              disabled={route.disabled}
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
