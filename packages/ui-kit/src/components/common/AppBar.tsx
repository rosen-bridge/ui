import { FC, ReactNode } from 'react';

import { styled } from '../../styling';
import { Box, CircularProgress, Typography } from '../base';

interface AppBarProps {
  logo?: ReactNode;
  versions?: Version[];
  navigationBar?: ReactNode;
}

interface Version {
  important?: boolean;
  title: string;
  value?: string;
}

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
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

const Versions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'row',
    justifyContent: 'start',
    position: 'absolute',
    left: '46px',
    top: '32px',
    gap: theme.spacing(1),
  },
}));

/**
 * renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 */
export const AppBar: FC<AppBarProps> = ({
  logo,
  versions = [],
  navigationBar,
}) => {
  const loadingVersions = versions.every((version) => version.value);
  return (
    <Root>
      {logo}
      {navigationBar}
      <Versions>
        {loadingVersions ? (
          versions.map((version) => (
            <Typography
              key={version.title}
              color={version.important ? 'textPrimary' : 'textSecondary'}
              variant={version.important ? 'body2' : 'subtitle2'}
            >
              {version.title} v{version.value}
            </Typography>
          ))
        ) : (
          <CircularProgress sx={{ mt: 0.5 }} size={8} />
        )}
      </Versions>
    </Root>
  );
};
