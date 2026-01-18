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

  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo />
        </Link>
      }
      versions={<VersionConfig />}
      navigationBar={
        <NavigationBar
          isActive={(path) => pathname === path}
          onClick={(path) => router.push(path)}
        >
          <NavigationButton icon={<Dashboard />} label="Dashboard" path="/" />
          <NavigationButton
            icon={<Heartbeat />}
            label="Health"
            path="/health"
          />
          <NavigationButton
            icon={<ClipboardNotes />}
            label="Events"
            path="/events"
          />
          <NavigationButton
            icon={<History />}
            label="History"
            path="/history"
          />
          <NavigationButton
            icon={<BitcoinCircle />}
            label="Assets"
            path="/assets"
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
