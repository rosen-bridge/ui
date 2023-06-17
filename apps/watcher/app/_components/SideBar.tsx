import * as Unicons from '@iconscout/react-unicons';
import { usePathname, useRouter } from 'next/navigation';

import { AppBar, AppLogo, Grid, NavigationButton } from '@rosen-bridge/ui-kit';

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
            icon={<Unicons.UilEstate />}
            onClick={() =>
              router.push('/' as Parameters<typeof router.push>[0])
            }
            isActive={pathname === '/'}
          ></NavigationButton>
        </Grid>
        <Grid item>
          <NavigationButton
            label="Health"
            icon={<Unicons.UilHeartbeat />}
            onClick={() => router.push('/health')}
            isActive={pathname.startsWith('/health')}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Observations"
            icon={<Unicons.UilNewspaper />}
            onClick={() => router.push('/observations')}
            isActive={pathname.startsWith('/observations')}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Events"
            icon={<Unicons.UilClipboardNotes />}
            onClick={() => router.push('/events')}
            isActive={pathname.startsWith('/events')}
          />
        </Grid>
        <Grid item>
          <NavigationButton
            label="Revenues"
            icon={<Unicons.UilMoneybag />}
            onClick={() => router.push('/revenues')}
            isActive={pathname.startsWith('/revenues')}
          />
        </Grid>
      </Grid>
      {/*
        TODO: implement toolbar component
        https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
      */}
    </AppBar>
  );
};

export default SideBar;
