import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Estate,
  Heartbeat,
  Newspaper,
  ClipboardNotes,
  Moneybag,
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
      label: 'Home',
      path: '/',
      icon: <Estate />,
    },
    {
      label: 'Health',
      path: '/health',
      icon: <Heartbeat />,
    },
    {
      label: 'Observations',
      path: '/observations',
      icon: <Newspaper />,
    },
    {
      label: 'Events',
      path: '/events',
      icon: <ClipboardNotes />,
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
