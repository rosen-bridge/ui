import React, { Fragment } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Copy, QrcodeScan } from '@rosen-bridge/icons';
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Id,
  SvgIcon,
  Typography,
  styled,
  SuccessfulCopySnackbar,
  QrCodeModal,
  Amount,
  Card,
} from '@rosen-bridge/ui-kit';
import { AugmentedPalette } from '@rosen-ui/types';
import { getDecimalString } from '@rosen-ui/utils';

import { TokenInfoWithAddress } from '@/_types/api';

interface WidgetCardProps {
  widgetColor: keyof AugmentedPalette;
}
/**
 * base component for `WalletWidget`
 *
 * @param widgetColor
 */
const WalletWidgetBase = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'widgetColor',
})<WidgetCardProps>(({ theme, ...props }) => ({
  'padding': theme.spacing(2),
  'backgroundColor': theme.palette[props.widgetColor].main,
  'backgroundImage':
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${
          theme.palette[props.widgetColor].main
        } 0%, ${theme.palette[props.widgetColor].dark} 100%)`
      : 'none',
  'color': theme.palette.success.contrastText,
  'flexGrow': 1,
  '& .title': {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: 'bold',
  },
  '& .value': {
    'fontSize': theme.typography.h2.fontSize,
    'fontWeight': 'bold',
    'textAlign': 'right',
    '& span': {
      fontSize: '50%',
      fontWeight: 'normal',
    },
  },
  '& .address-container': {
    '& .heading': {
      fontSize: theme.typography.body2.fontSize,
      opacity: 0.8,
      display: 'inline',
    },
    '& .address': {
      fontSize: theme.typography.body2.fontSize,
      opacity: 0.8,
    },
    '& .actions': {
      visibility: 'hidden',
      float: 'right',
      margin: theme.spacing(0.5),
    },
  },
  '&:hover .address-container': {
    '& .actions': {
      visibility: 'visible',
    },
  },
}));

interface WalletWidgetProps {
  title: string;
  tokenInfoWithAddresses: TokenInfoWithAddress[];
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
export const WalletWidget = ({
  title,
  tokenInfoWithAddresses,
  color,
  isLoading,
}: WalletWidgetProps) => {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [modalAddress, setModalAddress] = React.useState<string | null>(null);

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleCopy = async () => {
    setSnackbarOpen(true);
  };

  return (
    <WalletWidgetBase widgetColor={color}>
      <Typography className="title">{title}</Typography>
      {isLoading ? (
        <CircularProgress color="inherit" size={16} sx={{ mt: 1 }} />
      ) : (
        <>
          <div className="value">
            {tokenInfoWithAddresses.map((tokenInfoWithAddress, index) => (
              <Fragment
                key={`${tokenInfoWithAddress.chain}:${tokenInfoWithAddress.address}:${tokenInfoWithAddress.balance.tokenId}`}
              >
                {!!index && ' / '}
                <Typography variant="subtitle1" display="inline-block">
                  <Amount
                    unit={tokenInfoWithAddress.balance.name}
                    value={getDecimalString(
                      tokenInfoWithAddress.balance.amount,
                      tokenInfoWithAddress.balance.decimals,
                      3,
                    )}
                  />
                </Typography>
              </Fragment>
            ))}
          </div>
          {tokenInfoWithAddresses.map((tokenInfoWithAddress) => (
            <Box
              className="address-container"
              key={`${tokenInfoWithAddress.chain}:${tokenInfoWithAddress.address}:${tokenInfoWithAddress.balance.tokenId}`}
            >
              <Grid container alignItems="center">
                <Grid item mobile>
                  <Typography className="heading">
                    {`${tokenInfoWithAddress.chain.toUpperCase()}: `}
                  </Typography>
                  <Id id={tokenInfoWithAddress.address} indicator="middle" />
                </Grid>
                <Grid item>
                  <Box className="address-container">
                    <Box className="actions">
                      <CopyToClipboard
                        text={tokenInfoWithAddress.address}
                        onCopy={handleCopy}
                      >
                        <IconButton
                          size="small"
                          sx={{ color: (theme) => theme.palette.common.white }}
                        >
                          <SvgIcon fontSize="small">
                            <Copy />
                          </SvgIcon>
                        </IconButton>
                      </CopyToClipboard>
                      <IconButton
                        size="small"
                        sx={{ color: (theme) => theme.palette.common.white }}
                        onClick={() =>
                          setModalAddress(tokenInfoWithAddress.address)
                        }
                      >
                        <SvgIcon fontSize="small">
                          <QrcodeScan />
                        </SvgIcon>
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </>
      )}
      <SuccessfulCopySnackbar
        open={snackbarOpen}
        handleClose={handleSnackbarClose}
      />
      <QrCodeModal
        open={!!modalAddress}
        handleClose={() => setModalAddress(null)}
        text={modalAddress ?? ''}
      />
    </WalletWidgetBase>
  );
};
