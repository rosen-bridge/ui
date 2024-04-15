import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Archway,
  BitcoinCircle,
  Dashboard,
  Exchange,
  Headphones,
} from '@rosen-bridge/icons';
import {
  AppBar,
  AppLogo,
  Grid,
  NavigationButton,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';

/**
 * render sidebar log and navigaiton buttons
 */
const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  return (
    <AppBar>
      <Link href="/">
        <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png"></AppLogo>
      </Link>
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
      <Grid item>
        <Typography
          textAlign="center"
          variant="subtitle2"
          color="textSecondary"
        >
          UI v{packageJson.version}
        </Typography>
      </Grid>
    </AppBar>
  );
};

export default SideBar;
