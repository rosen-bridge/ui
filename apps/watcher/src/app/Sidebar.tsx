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
          <NavigationButton icon="Estate" href="/">
            Home
          </NavigationButton>
          <NavigationButton icon="Heartbeat" href="/health">
            Health
          </NavigationButton>
          <NavigationButton icon="Newspaper" href="/observations">
            Observations
          </NavigationButton>
          <NavigationButton icon="ClipboardNotes" href="/events">
            Events
          </NavigationButton>
          <NavigationButton icon="Moneybag" href="/revenues">
            Revenues
          </NavigationButton>
        </Navigation>
      }
      actions={<Actions sidebar />}
    />
  );
};
