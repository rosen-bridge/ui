import Card from '@mui/material/Card/Card';
import { AugmentedPalette } from '@rosen-ui/types';

import { styled } from '../../styling';

interface InfoWidgetCardBaseProps {
  widgetColor: keyof AugmentedPalette;
}

export const InfoWidgetCardBase = styled(Card)<InfoWidgetCardBaseProps>(
  ({ theme, ...props }) => ({
    'padding': theme.spacing(2),
    'backgroundColor': theme.palette[props.widgetColor].main,
    'color': theme.palette[props.widgetColor].contrastText,
    'display': 'flex',
    'gap': theme.spacing(2),
    '& .column': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: theme.spacing(0.5),
    },
    '& .title': {
      fontSize: theme.typography.body2.fontSize,
      lineHeight: 1,
      opacity: 0.75,
    },
    '& .value': {
      'fontSize': theme.typography.h6.fontSize,
      'fontWeight': 'bold',
      'lineHeight': 1,
      'display': 'flex',
      'justifyContent': 'space-between',
      'alignItems': 'center',
      '& span': {
        fontSize: '60%',
        fontWeight: 'normal',
        opacity: 0.75,
      },
    },
    [theme.breakpoints.down('tablet')]: {
      'flexDirection': 'column',
      'alignItems': 'center',
      '& p': {
        textAlign: 'center',
      },
    },
  }),
);
