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
      </Grid>
    </AppBar>
  );
};

export default SideBar;
