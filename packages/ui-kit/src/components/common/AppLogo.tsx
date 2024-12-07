import { FC } from 'react';

import { useIsDarkMode, useIsMobile } from '../../hooks';
import { styled } from '../../styling';

const Image = styled('img')(({ theme }) => ({
  width: 64,
  height: 'unset',
  [theme.breakpoints.down('tablet')]: {
    width: 'unset',
    height: 32,
  },
}));

interface AppAvatarProps {
  darkLogoPath: string;
  lightLogoPath: string;
  darkLogoMobilePath: string;
  lightLogoMobilePath: string;
}

/**
 * renders brand logo and changes the logo in dark mode
 *
 * @param lightLogoPath - url to the light mode version of the logo
 * @param darkLogoPath - url to the dark mode version of the logo
 * @param darkLogoMobilePath - url to the light mode version of the logo on mobile
 * @param lightLogoMobilePath - url to the dark mode version of the logo on mobile
 */

export const AppLogo: FC<AppAvatarProps> = (props) => {
  const {
    darkLogoPath,
    lightLogoPath,
    darkLogoMobilePath,
    lightLogoMobilePath,
  } = props;

  const isDarkMode = useIsDarkMode();

  const isMobile = useIsMobile();

  return (
    <Image
      src={
        isDarkMode
          ? isMobile
            ? darkLogoMobilePath
            : darkLogoPath
          : isMobile
            ? lightLogoMobilePath
            : lightLogoPath
      }
    />
  );
};
