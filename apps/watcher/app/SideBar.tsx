import Link from 'next/link';
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
  CircularProgress,
  Grid,
  NavigationButton,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import useInfo from './_hooks/useInfo';

import packageJson from '../package.json';

/**
 * render sidebar log and navigaiton buttons
 */
const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const { data: info, isLoading } = useInfo();

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
      <Grid container item direction="column">
        {
          <Grid item>
            {!isLoading ? (
              <Typography
                textAlign="center"
                variant="body2"
                color="textPrimary"
              >
                Watcher v{info?.version ?? '?'}
              </Typography>
            ) : (
              <Grid mb={1} container justifyContent="center">
                <CircularProgress size={8} sx={{ alignSelf: 'center' }} />
              </Grid>
            )}
          </Grid>
        }
        <Grid item>
          <Typography
            textAlign="center"
            variant="subtitle2"
            color="textSecondary"
          >
            UI v{packageJson.version}
          </Typography>
        </Grid>
        <Grid item>
          {!isLoading ? (
            <Typography
              textAlign="center"
              variant="subtitle2"
              color="textSecondary"
            >
              Contract v{info?.versions?.contract ?? '?'}
            </Typography>
          ) : (
            <Grid mb={1} container justifyContent="center">
              <CircularProgress size={8} sx={{ alignSelf: 'center' }} />
            </Grid>
          )}
        </Grid>
        {!isLoading &&
          info?.versions?.contract !== info?.versions?.tokensMap && (
            <Grid item>
              <Typography
                textAlign="center"
                variant="subtitle2"
                color="textSecondary"
              >
                Tokens v{info?.versions?.tokensMap ?? '?'}
              </Typography>
            </Grid>
          )}
      </Grid>
    </AppBar>
  );
};

export default SideBar;
