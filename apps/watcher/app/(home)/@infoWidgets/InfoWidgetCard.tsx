import { ReactNode } from 'react';

import {
  Box,
  Card,
  CircularProgress,
  Typography,
  styled,
} from '@rosen-bridge/ui-kit';
import { AugmentedPalette } from '@rosen-ui/types';

interface InfoWidgetCardBaseProps {
  widgetColor: keyof AugmentedPalette;
}
/**
 * render an info widget card without any data
 *
 * @param color
 * @param icon
 * @param isLoading
 * @param title
 * @param unit
 * @param value
 */
const InfoWidgetCardBase = styled(Card)<InfoWidgetCardBaseProps>(
  ({ theme, ...props }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette[props.widgetColor].main,
    color: theme.palette[props.widgetColor].contrastText,
    display: 'flex',
    gap: theme.spacing(2),
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
      fontSize: theme.typography.h6.fontSize,
      fontWeight: 'bold',
      lineHeight: 1,
      '& span': {
        fontSize: '60%',
        fontWeight: 'normal',
        opacity: 0.75,
      },
    },
    [theme.breakpoints.down('tablet')]: {
      flexDirection: 'column',
      alignItems: 'center',
      '& p': {
        textAlign: 'center',
      },
    },
  }),
);

interface InfoWidgetCardProps {
  color?: keyof AugmentedPalette;
  icon: ReactNode;
  isLoading?: boolean;
  title: string;
  unit?: string;
  value: string;
}
/**
 * render an info widget card containing data
 *
 * @param color
 * @param icon
 * @param isLoading
 * @param title
 * @param unit
 * @param value
 */
const InfoWidgetCard = ({
  color = 'secondary',
  icon,
  isLoading,
  title,
  unit,
  value,
}: InfoWidgetCardProps) => {
  return (
    <InfoWidgetCardBase widgetColor={color}>
      <Box className="column">{icon}</Box>
      <Box className="column" flexGrow={1}>
        {isLoading ? (
          <div>
            <CircularProgress size={16} color="inherit" />
          </div>
        ) : (
          <Typography className="value">
            {value}
            &nbsp;
            <span>{unit}</span>
          </Typography>
        )}
        <Typography className="title">{title}</Typography>
      </Box>
    </InfoWidgetCardBase>
  );
};

export default InfoWidgetCard;
