import Link from 'next/link';

import {
  AppBar,
  AppLogo,
  NavigationBar,
  NavigationButton,
} from '@rosen-bridge/ui-kit';

import { Actions } from './Actions';

export const Sidebar = () => {
  return (
    <AppBar
      logo={
        <Link href="/" style={{ display: 'flex' }}>
          <AppLogo />
        </Link>
      }
      links={
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
      actions={<Actions sidebar />}
    />
  );
};
