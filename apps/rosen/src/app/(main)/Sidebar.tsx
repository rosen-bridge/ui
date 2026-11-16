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
          <NavigationButton icon="CommentAltExclamation" href="/faqs">
            FAQs
          </NavigationButton>
        </Navigation>
      }
      actions={<Actions sidebar />}
    />
  );
};
