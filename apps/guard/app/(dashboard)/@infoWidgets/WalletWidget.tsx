import React from 'react';

import {
  Box,
  Card,
  styled,
  Typography,
  Id,
  CircularProgress,
} from '@rosen-bridge/ui-kit';
import { AugmentedPalette } from '@rosen-ui/types';

interface WidgetCardProps {
  widgetColor: keyof AugmentedPalette;
}
/**
 * base component for `WalletWidget`
 *
 * @param widgetColor
 */
const WalletWidgetBase = styled(Card)<WidgetCardProps>(
  ({ theme, ...props }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette[props.widgetColor].main,
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(180deg, ${
            theme.palette[props.widgetColor].main
          } 0%, ${theme.palette[props.widgetColor].dark} 100%)`
        : 'none',
    color: theme.palette.success.contrastText,
    flexGrow: 1,
    '& .title': {
      fontSize: theme.typography.h5.fontSize,
      fontWeight: 'bold',
    },
    '& .value': {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: 'bold',
      textAlign: 'right',
      '& span': {
        fontSize: '50%',
        fontWeight: 'normal',
      },
    },
    '& .address-container': {
      '& .heading': {
        fontSize: theme.typography.body2.fontSize,
        opacity: 0.8,
      },
      '& .address': {
        fontSize: theme.typography.body2.fontSize,
        opacity: 0.8,
      },
      '& .actions': {
        visibility: 'hidden',
        float: 'right',
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
      },
    },
    '&:hover .address-container': {
      '& .actions': {
        visibility: 'visible',
      },
    },
  })
);

interface WalletWidgetProps {
  title: string;
  value?: string;
  address?: string;
  color: keyof AugmentedPalette;
  isLoading: boolean;
}
/**
 * render a widget for hot or cold wallet, showing its balance and address
 *
 * @param title
 * @param value
 * @param address
 * @param color
 * @param isLoading
 */
const WalletWidget = ({
  title,
  value,
  address,
  color,
  isLoading,
}: WalletWidgetProps) => (
  <WalletWidgetBase widgetColor={color}>
    <Typography className="title">{title}</Typography>
    {isLoading ? (
      <CircularProgress color="inherit" size={16} sx={{ mt: 1 }} />
    ) : (
      <>
        <Typography className="value">
          {value} <span>ERG</span>
        </Typography>
        <Box className="address-container">
          <Typography className="heading">ADDRESS</Typography>
          <Id id={address!} />
        </Box>
      </>
    )}
  </WalletWidgetBase>
);

export default WalletWidget;
