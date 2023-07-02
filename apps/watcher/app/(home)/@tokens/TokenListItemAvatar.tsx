import { useIsDarkMode, Avatar } from '@rosen-bridge/ui-kit';

/**
 * FIXME: use theme defined values
 * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
 */
const PALETTE = ['#0081cf', '#0089ba', '#008e9b'];

interface TokenListItemAvatarProps {
  name: string;
  index: number;
}
/**
 * render an avatar containing the first letter of `name` to be used inside a
 * `TokenListItem`
 * @param name
 * @param index index used to change background color of avatar
 */
const TokenListItemAvatar = ({ name, index }: TokenListItemAvatarProps) => {
  const isDarkMode = useIsDarkMode();

  return (
    <Avatar
      sx={{
        color: isDarkMode ? 'text.secondary' : 'info.light',
        /**
         * FIXME: use theme defined values
         * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
         */
        bgcolor: isDarkMode ? '#00000033' : PALETTE[index % 2],
      }}
    >
      {name[0]}
    </Avatar>
  );
};

export default TokenListItemAvatar;
