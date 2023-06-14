import { Box } from '../base';

import { styled } from '../../styling';

/**
 * @description renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 *
 * @property {ReactNode} children - should be the list of react elements that need to be in the toolbar
 */

export const AppBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexBasis: 112,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('tablet')]: {
    padding: theme.spacing(1),
    flexBasis: 64,
    flexDirection: 'row',
  },
}));
