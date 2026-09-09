import Link from 'next/link';

import { AppBar, AppLogo, Navigation, NavigationButton } from '@rosen-bridge/ui-kit';

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
        <Navigation>
          <NavigationButton icon="Archway" href="/">
            Bridge
          </NavigationButton>
          <NavigationButton icon="Exchange" href="/events">
            Events
          </NavigationButton>
          <NavigationButton icon="BitcoinCircle" href="/assets">
            Assets
          </NavigationButton>
          <NavigationButton disabled={true} icon="Headphones" href="/support">
            Support
          </NavigationButton>
          <NavigationButton disabled={true} icon="Dashboard" href="/dashboard">
            Dashboard
          </NavigationButton>
        </Navigation>
      }
      actions={<Actions sidebar />}
    />
  );
};
