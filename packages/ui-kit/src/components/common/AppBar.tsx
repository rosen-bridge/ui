import { Box } from '../base';

import { styled } from '../../styling';

/**
 *  renders a appBar wrapper
 * this component set the appBar size and orientation in different screen sizes
 *
 * @property {ReactNode} children - should be the list of react elements that need to be in the toolbar
 */

export const AppBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
  flexBasis: 112,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('tablet')]: {
    padding: theme.spacing(1),
    //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
    flexBasis: 64,
    flexDirection: 'row',
  },
}));
