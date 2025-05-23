import { FC, ReactNode } from 'react';

import { useIsMobile } from '../../hooks';
import { styled } from '../../styling';
import { Box } from '../base';

interface AppBarProps {
  logo?: ReactNode;
  versions?: ReactNode;
  navigationBar?: ReactNode;
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
    padding: theme.spacing(0),
    flexBasis: 56,
    flexDirection: 'row',
  },
}));

/**
 * renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 */
export const AppBar: FC<AppBarProps> = ({ logo, versions, navigationBar }) => {
  const isMobile = useIsMobile();

  return (
    <Root>
      {logo}
      {navigationBar}
      {!isMobile && versions}
    </Root>
  );
};
