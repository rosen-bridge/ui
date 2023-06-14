import { useMemo, FC, ReactNode } from 'react';

import { Avatar, Typography } from '../base';

import { styled } from '../../styling';

import { useIsMobile, useIsDarkMode } from '../../hooks';

const Brand = styled(Typography)(({ theme }) => ({
  //FIXME: use theme defined values - https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/3
  color: theme.palette.mode === 'light' ? '#e5e5e5' : '#ff9b03',
  textTransform: 'uppercase',
  textAlign: 'center',
  margin: theme.spacing(1),

  //FIXME: use theme defined values - https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/3
  lineHeight: 1.2,
  [theme.breakpoints.up('tablet')]: {
    //FIXME: use theme defined values - https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/3
    fontSize: '0.75rem',
    '& b': {
      //FIXME: use theme defined values - https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/3
      fontSize: '108%',
    },
  },
}));

interface AppAvatarProps {
  title: ReactNode;
  darkLogoPath: string;
  lightLogoPath: string;
}

/**
 * @description renders brand logo and title and changes the logo in dark mode
 *
 * @param lightLogoPath - url to the light mode version of the logo
 * @param darkLogoPath - url to the dark mode version of the logo
 * @param title - the brand logo title to render under the logo
 */

export const AppAvatar: FC<AppAvatarProps> = (props) => {
  const { title, darkLogoPath, lightLogoPath } = props;

  const isDarkMod = useIsDarkMode();
  const isMobile = useIsMobile();

  const sxSize = useMemo(() => {
    const size = isMobile ? 36 : 64;
    return { width: size, height: size };
  }, [isMobile]);

  return (
    <>
      <Avatar src={isDarkMod ? darkLogoPath : lightLogoPath} sx={sxSize} />
      <Brand>{title}</Brand>
    </>
  );
};
