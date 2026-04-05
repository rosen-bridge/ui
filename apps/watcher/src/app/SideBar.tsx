import Link from 'next/link';

import {
  AppBar,
  AppLogo,
  NavigationBar,
  NavigationButton,
} from '@rosen-bridge/ui-kit';

import { Actions } from './Actions';

/**
 * render sidebar log and navigation buttons
 */
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
          <NavigationButton icon="Estate" label="Home" path="/" />
          <NavigationButton icon="Heartbeat" label="Health" path="/health" />
          <NavigationButton
            icon="Newspaper"
            label="Observations"
            path="/observations"
          />
          <NavigationButton
            icon="ClipboardNotes"
            label="Events"
            path="/events"
          />
          <NavigationButton icon="Moneybag" label="Revenues" path="/revenues" />
        </NavigationBar>
      }
      actions={<Actions sidebar />}
    />
  );
};
