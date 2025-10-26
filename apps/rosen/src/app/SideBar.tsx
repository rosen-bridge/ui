import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

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

import { CONTRACT_VERSION } from '../../configs';
import packageJson from '../../package.json';

/**
 * render sidebar log and navigaiton buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const sub = useMemo(() => {
    const result = [
      {
        label: 'Contract',
        value: CONTRACT_VERSION,
      },
    ];
    return result;
  }, []);

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
      versions={<Version label="UI" value={packageJson.version} sub={sub} />}
      navigationBar={
        <NavigationBar
          isActive={(path) => pathname === path}
          onClick={(path) => router.push(path)}
        >
          <NavigationButton icon={<Archway />} label="Bridge" path="/" />
          <NavigationButton
            badge="Beta"
            icon={<Exchange />}
            label="Events"
            path="/events"
          />
          <NavigationButton
            icon={<BitcoinCircle />}
            label="Assets"
            path="/assets"
          />
          <NavigationButton
            disabled={true}
            icon={<Headphones />}
            label="Support"
            path="/support"
          />
          <NavigationButton
            disabled={true}
            icon={<Dashboard />}
            label="Dashboard"
            path="/dashboard"
          />
        </NavigationBar>
      }
    />
  );
};
