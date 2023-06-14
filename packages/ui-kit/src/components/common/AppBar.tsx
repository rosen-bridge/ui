import { Box } from '../base';

import { styled } from '../../styling';

export const Appbar = styled(Box)(({ theme }) => ({
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
