import { usePathname, useRouter } from 'next/navigation';

import {
  BitcoinCircle,
  ClipboardNotes,
  Dashboard,
  Heartbeat,
  History,
  Moneybag,
} from '@rosen-bridge/icons';
import {
  AppBar,
  AppLogo,
  Grid,
  Navigation,
  NavigationButton,
  SvgIcon,
  useTheme,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';

import ToolbarActions from './ToolbarActions';

/**
 * render sidebar log and navigaiton buttons
 */
const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const theme = useTheme();
  const shouldShowAppBarActions = useMediaQuery(
    theme.breakpoints.down('tablet')
  );

  return (
    <AppBar>
      <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png"></AppLogo>
      <Navigation
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <NavigationButton
            label="Dashboard"
            icon={
              <SvgIcon>
                <Dashboard />
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
            label="Health"
            icon={
              <SvgIcon>
                <Heartbeat />
              </SvgIcon>
            }
            onClick={() => router.push('/health')}
            isActive={pathname === '/health'}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Events"
            icon={
              <SvgIcon>
                <ClipboardNotes />
              </SvgIcon>
            }
            onClick={() => router.push('/events')}
            isActive={pathname.startsWith('/events')}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="History"
            icon={
              <SvgIcon>
                <History />
              </SvgIcon>
            }
            onClick={() => router.push('/history')}
            isActive={pathname.startsWith('/history')}
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
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Revenues"
            icon={
              <SvgIcon>
                <Moneybag />
              </SvgIcon>
            }
            onClick={() => router.push('/revenues')}
            isActive={pathname.startsWith('/revenues')}
          />
        </Grid>
      </Navigation>
      {shouldShowAppBarActions && <ToolbarActions />}
    </AppBar>
  );
};

export default SideBar;
