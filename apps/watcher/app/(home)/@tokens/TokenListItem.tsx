import React from 'react';

import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@rosen-bridge/ui-kit';

import TokenListItemAvatar from './TokenListItemAvatar';
import Id from '@/_components/Id';

import getDecimalString from '@/_utils/getDecimalString';

const NAME_PLACEHOLDER = 'unnamed token';

interface TokenListItemProps {
  decimals: number;
  id: string;
  index: number;
  name?: string;
  value: string;
}
/**
 * render a token list item in the home page
 * @param decimals
 * @param id
 * @param index
 * @param name
 * @param value
 */
const TokenListItem = ({
  decimals,
  id,
  index,
  name,
  value,
}: TokenListItemProps) => {
  const nameOrPlaceholder = name || NAME_PLACEHOLDER;

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
          </Box>
        }
        secondary={<Id id={id} />}
        secondaryTypographyProps={{
          component: 'div',
          style: { fontSize: '0.75rem' },
        }}
      />
    </ListItem>
  );
};

export default TokenListItem;
