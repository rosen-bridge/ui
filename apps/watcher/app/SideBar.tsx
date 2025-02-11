import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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
  useIsMobile,
  Version,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';
import { useInfo } from './_hooks/useInfo';

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

  const { data: info, isLoading } = useInfo();

  const sub = useMemo(() => {
    const result = [
      {
        label: 'UI',
        value: packageJson.version,
      },
      {
        label: 'Contract',
        value: info?.versions.contract,
      },
    ];
    if (!isLoading && info?.versions.contract !== info?.versions.tokensMap) {
      result.push({
        label: 'Tokens',
        value: info!.versions.tokensMap,
      });
    }
    return result;
  }, [info, isLoading]);

  const isMobile = useIsMobile();

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
      versions={
        !isMobile && (
          <Version label="Watcher" value={info?.versions.app} sub={sub} />
        )
      }
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
