import { usePathname, useRouter } from 'next/navigation';

import {
  Archway,
  Exchange,
  BitcoinCircle,
  Dashboard,
  Headphones,
} from '@rosen-bridge/icons';
import {
  AppBar,
  AppLogo,
  Grid,
  NavigationButton,
  SvgIcon,
} from '@rosen-bridge/ui-kit';

/**
 * render sidebar log and navigaiton buttons
 */
const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  return (
    <AppBar>
      <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png"></AppLogo>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        flexGrow={1}
      >
        <Grid item>
          <NavigationButton
            label="Bridge"
            icon={
              <SvgIcon>
                <Archway />
              </SvgIcon>
            }
            onClick={() =>
              router.push('/' as Parameters<typeof router.push>[0])
            }
            isActive={pathname === '/'}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Events"
            icon={
              <SvgIcon>
                <Exchange />
              </SvgIcon>
            }
            onClick={() => router.push('/events')}
            isActive={pathname === '/events'}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Assets"
            icon={
              <SvgIcon>
                <BitcoinCircle />
              </SvgIcon>
            }
            onClick={() => router.push('/assets')}
            isActive={pathname.startsWith('/assets')}
            disabled
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Support"
            icon={
              <SvgIcon>
                <Headphones />
              </SvgIcon>
            }
            onClick={() => router.push('/support')}
            isActive={pathname.startsWith('/support')}
            disabled
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Dashboard"
            icon={
              <SvgIcon>
                <Dashboard />
              </SvgIcon>
            }
            onClick={() => router.push('/dashboard')}
            isActive={pathname.startsWith('/dashboard')}
            disabled
          />
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default SideBar;
