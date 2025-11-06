import { HTMLAttributes, useCallback, useMemo, useState } from 'react';

import { ExternalLinkAlt, Qrcode } from '@rosen-bridge/icons';

import { IconButton, Skeleton, Tooltip } from '../../base';
import { CopyButton } from '../CopyButton';
import { InjectOverrides } from '../InjectOverrides';
import { QrCodeModal } from '../QrCodeModal';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';

export type IdentifierProps = HTMLAttributes<HTMLDivElement> & {
  /** If true, enables a button to copy the value to the clipboard */
  copyable?: boolean;

  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  /** If true, shows a loading skeleton instead of the value */
  loading?: boolean;

  /** If true, displays a QR code icon */
  qrcode?: boolean;

  /** Number of characters to show at the end*/
  trailingLength?: number;

  /** The main string value to display (e.g., an identifier or long string) */
  value?: string;
};

/**
 * Identifier component displays a formatted string with optional helper actions.
 *
 * It truncates the value, preserving the last few characters,
 * and can show an external link (opens in new tab), a copy button, and a QR code icon.
 *
 * @example
 *
 * <Identifier
 *   value="0x123456789abcdef"
 *   href="https://example.com/details/0x123456789abcdef"
 *   copyable
 *   qrcode
 * />
 *
 */
const IdentifierBase = ({
  copyable,
  href,
  loading,
  qrcode,
  trailingLength = 5,
  value = '',
  style,
  ...props
}: IdentifierProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const styles = useMemo(
    () =>
      Object.assign(
        {},
        {
          minWidth: 0,
        },
        style,
      ),
    [style],
  );

  return (
    <Stack
      direction="row"
      align="center"
      justify="between"
      style={styles}
      {...props}
    >
      {loading && <Skeleton style={{ flexGrow: 1 }} />}
      {!loading && (
        <>
          <Tooltip title={value}>
            <Stack
              direction="row"
              align="center"
              style={{
                minWidth: 0,
                fontFamily: 'monospace',
              }}
            >
              <div
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                {value.slice(0, -trailingLength)}
              </div>
              <span style={{ flexShrink: 0 }}>
                {value.slice(-trailingLength)}
              </span>
            </Stack>
          </Tooltip>
          <Stack direction="row" align="center">
            {!!href && (
              <IconButton target="_blank" size="small" href={href}>
                <SvgIcon size="small">
                  <ExternalLinkAlt />
                </SvgIcon>
              </IconButton>
            )}
            {copyable && <CopyButton value={value} size="small" />}
            {qrcode && (
              <>
                <IconButton size="small" onClick={handleOpen}>
                  <SvgIcon size="small">
                    <Qrcode />
                  </SvgIcon>
                </IconButton>
                <QrCodeModal
                  open={open}
                  handleClose={handleClose}
                  text={value}
                />
              </>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export const Identifier = InjectOverrides(IdentifierBase);
