import { Avatar } from '../../base';

import { useIsDarkMode } from '../../../hooks';

export interface TokenListItemAvatarProps {
  name: string;
  index: number;
}
/**
 * render an avatar containing the first letter of `name` to be used inside a
 * `TokenListItem`
 *
 * @param name
 * @param index index used to change background color of avatar
 */
export const TokenListItemAvatar = ({
  name,
  index,
}: TokenListItemAvatarProps) => {
  const isDarkMode = useIsDarkMode();

  return (
    <Avatar
      sx={{
        color: isDarkMode ? 'info.light' : 'info.main',
        bgcolor: isDarkMode ? 'background.shadow' : 'info.light',
      }}
    >
      {name[0]}
    </Avatar>
  );
};
