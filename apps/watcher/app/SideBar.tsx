import { usePathname, useRouter } from 'next/navigation';

import {
  ClipboardNotes,
  Estate,
  Heartbeat,
  Moneybag,
  Newspaper,
} from '@rosen-bridge/icons';

import {
  AppBar,
  AppLogo,
  Grid,
  Navigation,
  NavigationButton,
  SvgIcon,
  useMediaQuery,
  useTheme,
} from '@rosen-bridge/ui-kit';

import ToolbarActions from './ToolbarActions';

/**
 * render sidebar log and navigation buttons
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
        flexGrow={1}
      >
        <Grid item>
          <NavigationButton
            label="Home"
            icon={
              <SvgIcon>
                <Estate />
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
            isActive={pathname.startsWith('/health')}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Observations"
            icon={
              <SvgIcon>
                <Newspaper />
              </SvgIcon>
            }
            onClick={() => router.push('/observations')}
            isActive={pathname.startsWith('/observations')}
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
