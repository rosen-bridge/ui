import { useMemo, FC, ReactNode } from 'react';

import { Avatar, Typography } from '../base';

import { styled } from '../../styling';

import { useIsMobile, useIsDarkMode } from '../../hooks';

const Brand = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? '#e5e5e5' : '#ff9b03',
  textTransform: 'uppercase',
  textAlign: 'center',
  margin: theme.spacing(1),
  lineHeight: 1.2,
  [theme.breakpoints.up('tablet')]: {
    fontSize: '0.75rem',
    '& b': {
      fontSize: '108%',
    },
  },
}));

interface AppAvatarProps {
  title: ReactNode;
  darkLogoPath: string;
  lightLogoPath: string;
}

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
