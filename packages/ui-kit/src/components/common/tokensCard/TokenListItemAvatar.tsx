import { Avatar } from '../../base';

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
export const TokenListItemAvatar = ({ name }: TokenListItemAvatarProps) => {
  return (
    <Avatar
      sx={{
        color: 'primary.main',
        bgcolor: 'primary.light',
      }}
    >
      {name[0]}
    </Avatar>
  );
};
