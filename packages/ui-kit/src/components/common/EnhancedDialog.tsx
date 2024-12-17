import { styled } from '../../styling';
import { Dialog } from '../base';

/**
 * renders an enhanced version of material ui Dialog
 */
export const EnhancedDialog = styled(Dialog)(({ theme }) => ({
  [theme.breakpoints.down('tablet')]: {
    '& > .MuiDialog-container': {
      'alignItems': 'end',
      '& > .MuiPaper-root': {
        margin: 0,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
      },
    },
  },
}));
