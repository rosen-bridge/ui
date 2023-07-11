import { Grid } from '../base';

import { styled } from '../../styling';

/**
 * renders the navigation buttons and navigation bar and
 * handles responsive mode
 */

export const Navigation = styled(Grid)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing('auto', 0),
  gap: theme.spacing(1),

  [theme.breakpoints.down('tablet')]: {
    position: 'fixed',
    width: `calc(100% - ${theme.spacing(2)})`,
    bottom: 0,
    left: 0,
    margin: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    flexDirection: 'row',
    gap: theme.spacing(0.5),
    zIndex: 1000,
    flexWrap: 'nowrap',
  },
}));
