import { TOKEN_NAME_PLACEHOLDER } from '@rosen-ui/constants';
import { getDecimalString } from '@rosen-ui/utils';

import { Id } from '..';
import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '../../base';
import { TokenListItemAvatar } from './TokenListItemAvatar';
import { useTheme } from '../../../hooks';

export interface TokenListItemProps {
  decimals: number;
  id: string;
  index: number;
  name?: string;
  value: string;
  coldValue?: string;
  isNativeToken: boolean;
}
/**
 * render a token list item, showing its name, id, avatar and value
 * @param decimals
 * @param id
 * @param index
 * @param name
 * @param value
 */
export const TokenListItem = ({
  decimals,
  id,
  index,
  name,
  value,
  coldValue,
  isNativeToken,
}: TokenListItemProps) => {
  const nameOrPlaceholder = name || TOKEN_NAME_PLACEHOLDER;
  const theme = useTheme();

  return (
    <ListItem disableGutters sx={{ py: 0.5 }}>
      <ListItemAvatar>
        <TokenListItemAvatar name={nameOrPlaceholder} index={index} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex' }}>
            <Typography sx={{ flexGrow: 1 }}>{nameOrPlaceholder}</Typography>
            <Typography>{getDecimalString(value, decimals)}</Typography>
            <Typography variant="caption" mt={0.25}>
              {coldValue !== undefined && '🔥'}
            </Typography>
            {coldValue && (
              <>
                <Typography ml={0.5}>
                  {' '}
                  / {getDecimalString(coldValue, decimals)}
                </Typography>
                <Typography variant="caption" mt={0.5}>
                  {' '}
                  ❄️
                </Typography>
              </>
            )}
          </Box>
        }
        secondary={isNativeToken ? id : <Id id={id} indicator="middle" />}
        secondaryTypographyProps={{
          component: 'div',
          style: { fontSize: theme.typography.body2.fontSize },
        }}
      />
    </ListItem>
  );
};
