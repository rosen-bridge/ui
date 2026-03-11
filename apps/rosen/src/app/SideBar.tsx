import Link from 'next/link';
import React from 'react';

import {
  AppBar,
  AppLogo,
  NavigationBar,
  NavigationButton,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

/**
 * render sidebar log and navigaiton buttons
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
    />
  );
};
