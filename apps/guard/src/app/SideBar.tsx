import Link from 'next/link';

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
  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo />
        </Link>
      }
      versions={<VersionConfig />}
      navigationBar={
        <NavigationBar>
          <NavigationButton icon="Dashboard" label="Dashboard" path="/" />
          <NavigationButton icon="Heartbeat" label="Health" path="/health" />
          <NavigationButton
            icon="ClipboardNotes"
            label="Events"
            path="/events"
          />
          <NavigationButton icon="History" label="History" path="/history" />
          <NavigationButton
            icon="BitcoinCircle"
            label="Assets"
            path="/assets"
          />
          <NavigationButton icon="Moneybag" label="Revenues" path="/revenues" />
        </NavigationBar>
      }
    />
  );
};
