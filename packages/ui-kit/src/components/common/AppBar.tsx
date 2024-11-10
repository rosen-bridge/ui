import { FC, ReactNode } from 'react';

import { styled } from '../../styling';
import { Box, CircularProgress, Grid, Typography } from '../base';
import { NavigationButton } from './NavigationButton';

interface AppBarProps {
  children?: ReactNode;
  logo?: ReactNode;
  routes?: Route[];
  versions?: Version[];
  isActive?: (route: Route) => boolean;
  onNavigate?: (route: Route) => void;
}

interface Route {
  badge?: string;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  path: string;
}

interface Version {
  important?: boolean;
  title: string;
  value?: string;
}

const Root = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2) + ' 0',
  flexBasis: 116,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('tablet')]: {
    padding: theme.spacing(1),
    flexBasis: 64,
    flexDirection: 'row',
  },
}));

/**
 * renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 */
export const AppBar: FC<AppBarProps> = ({
  children,
  logo,
  routes,
  versions = [],
  isActive,
  onNavigate,
}) => {
  const loadingVersions = versions.every((version) => version.value);
  return (
    <Root>
      {children}
      {logo}
      {routes && (
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          flexGrow={1}
        >
          {routes.map((route) => (
            <Grid key={route.label} item>
              <NavigationButton
                badge={route.badge}
                disabled={route.disabled}
                icon={route.icon}
                isActive={isActive?.(route)}
                label={route.label}
                onClick={() => onNavigate?.(route)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      {loadingVersions ? (
        versions.map((version) => (
          <Grid key={version.title} item>
            <Typography
              color={version.important ? 'textPrimary' : 'textSecondary'}
              textAlign="center"
              variant={version.important ? 'body2' : 'subtitle2'}
            >
              {version.title} v{version.value}
            </Typography>
          </Grid>
        ))
      ) : (
        <Grid mb={1} container justifyContent="center">
          <CircularProgress size={8} sx={{ alignSelf: 'center' }} />
        </Grid>
      )}
    </Root>
  );
};
