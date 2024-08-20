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
  Typography,
} from '@rosen-bridge/ui-kit';

import packageJson from '../package.json';

const ROUTES = [
  {
    label: 'Bridge',
    path: '/',
    disabled: false,
    icon: <Archway />,
  },
  {
    label: 'Events',
    path: '/events',
    disabled: false,
    icon: <Exchange />,
  },
  {
    label: 'Assets',
    path: '/assets',
    disabled: false,
    icon: <BitcoinCircle />,
    badge: 'Beta',
  },
  {
    label: 'Support',
    path: '/support',
    disabled: true,
    icon: <Headphones />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    disabled: true,
    icon: <Dashboard />,
  },
];

/**
 * render sidebar log and navigaiton buttons
 */
export const SideBar = () => {
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
        {ROUTES.map((route) => (
          <Grid key={route.label} item>
            <NavigationButton
              badge={route.badge}
              disabled={route.disabled}
              icon={route.icon}
              isActive={pathname === route.path}
              label={route.label}
              onClick={() => router.push(route.path)}
            />
          </Grid>
        ))}
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
