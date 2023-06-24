import React from 'react';

import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
} from '@rosen-bridge/ui-kit';

/**
 * render a skeleton for `TokenListItem`
 */
const TokenListItemSkeleton = () => {
  return (
    <ListItem disableGutters sx={{ py: 0.5 }}>
      <ListItemAvatar>
        <Skeleton animation="wave" variant="circular" width={40} height={40} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton animation="wave" height={20} width="40%" />
            <Skeleton animation="wave" height={20} width="10%" />
          </Box>
        }
        secondary={<Skeleton animation="wave" height={20} width="50%" />}
      />
    </ListItem>
  );
};

export default TokenListItemSkeleton;
