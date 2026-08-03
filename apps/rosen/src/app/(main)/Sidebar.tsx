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
          <NavigationButton icon="Archway" label="Bridge" path="/" />
          <NavigationButton
            badge="Beta"
            icon="Exchange"
            label="Events"
            path="/events"
          />
          <NavigationButton
            icon="BitcoinCircle"
            label="Assets"
            path="/assets"
          />
          <NavigationButton
            disabled={true}
            icon="Headphones"
            label="Support"
            path="/support"
          />
          <NavigationButton
            disabled={true}
            icon="Dashboard"
            label="Dashboard"
            path="/dashboard"
          />
        </NavigationBar>
      }
      actions={<Actions sidebar />}
    />
  );
};
