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
        <NavigationBar
          isActive={(path) => pathname === path}
          onClick={(path) => router.push(path)}
        >
          <NavigationButton icon={<Estate />} label="Home" path="/" />
          <NavigationButton
            icon={<Heartbeat />}
            label="Health"
            path="/health"
          />
          <NavigationButton
            icon={<Newspaper />}
            label="Observations"
            path="/observations"
          />
          <NavigationButton
            icon={<ClipboardNotes />}
            label="Events"
            path="/events"
          />
          <NavigationButton
            icon={<Moneybag />}
            label="Revenues"
            path="/revenues"
          />
        </NavigationBar>
      }
    />
  );
};
