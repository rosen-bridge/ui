import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  BitcoinCircle,
  Dashboard,
  Heartbeat,
  History,
  Moneybag,
  ClipboardNotes,
} from '@rosen-bridge/icons';
import { AppBar, AppLogo } from '@rosen-bridge/ui-kit';
import { Grid, CircularProgress, Box } from '@mui/material';

import useInfo from './_hooks/useInfo';

import packageJson from '../package.json';

/**
 * render sidebar log and navigation buttons
 */
export const SideBar = () => {
  const pathname = usePathname();

  const router = useRouter();

  const { data: info, isLoading } = useInfo();

  const ShowLoading =
    isLoading || !info?.versions.app || !info?.versions.contract;

  const versions = !ShowLoading
    ? [
        {
          title: 'Guard',
          value: info?.versions.app,
          important: true,
        },
        {
          title: 'UI',
          value: packageJson.version,
        },
        {
          title: 'Contract',
          value: info?.versions.contract,
        },
      ]
    : [];

  if (!ShowLoading && info?.versions.contract !== info?.versions.tokensMap) {
    versions.push({
      title: 'Tokens',
      value: info?.versions.tokensMap,
    });
  }

  return (
    <AppBar
      logo={
        <Link href="/">
          <AppLogo darkLogoPath="/dark.png" lightLogoPath="/light.png" />
        </Link>
      }
      versions={versions}
      routes={[
        {
          label: 'Dashboard',
          path: '/',
          disabled: false,
          icon: <Dashboard />,
        },
        {
          label: 'Health',
          path: '/health',
          disabled: false,
          icon: <Heartbeat />,
        },
        {
          label: 'Events',
          path: '/events',
          disabled: false,
          icon: <ClipboardNotes />,
        },
        {
          label: 'History',
          path: '/history',
          disabled: false,
          icon: <History />,
        },
        {
          label: 'Assets',
          path: '/assets',
          disabled: false,
          icon: <BitcoinCircle />,
        },
        {
          label: 'Revenues',
          path: '/revenues',
          disabled: false,
          icon: <Moneybag />,
        },
      ]}
      isActive={(route) => pathname === route.path}
      onNavigate={(route) => router.push(route.path)}
    >
      {ShowLoading && (
        <Box position="absolute" bottom={0} paddingBottom={3}>
          <Grid container justifyContent="center" mb={1}>
            <CircularProgress size={8} sx={{ alignSelf: 'center' }} />
          </Grid>
        </Box>
      )}
    </AppBar>
  );
};
