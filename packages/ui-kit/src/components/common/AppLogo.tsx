import { FC } from 'react';

import { useIsDarkMode } from '../../hooks';
import { styled } from '../../styling';

const Image = styled('img')(({ theme }) => ({
  width: 64,
  [theme.breakpoints.down('tablet')]: {
    width: 36,
  },
}));

interface AppAvatarProps {
  darkLogoPath: string;
  lightLogoPath: string;
}

/**
 * renders brand logo and changes the logo in dark mode
 *
 * @param lightLogoPath - url to the light mode version of the logo
 * @param darkLogoPath - url to the dark mode version of the logo
 */

export const AppLogo: FC<AppAvatarProps> = (props) => {
  const { darkLogoPath, lightLogoPath } = props;

  const isDarkMode = useIsDarkMode();

  return <Image src={isDarkMode ? darkLogoPath : lightLogoPath} />;
};
