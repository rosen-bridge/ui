import { ComponentProps, useState } from 'react';

import { OverridableType } from '@/@types';
import {
  Skeleton,
  QrCodeDialog,
  CopyButton,
  Icon,
  IconButton,
  Tooltip,
  TooltipOverriddenProps,
  Typography,
  TypographyOverriddenProps,
} from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IdentifierOverrides {}

export type IdentifierOwnProps = {
  /** If true, enables a button to copy the value to the clipboard */
  copyable?: boolean;

  /** If provided, disables actions and displays this fallback text */
  fallback?: string;

  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  /** If true, shows a loading skeleton instead of the value */
  loading?: boolean;

  /** If true, displays a QR code icon */
  qrcode?: boolean;

  slots?: {
    leading?: TypographyOverriddenProps;
    text?: TypographyOverriddenProps;
    trailing?: TypographyOverriddenProps;
    tooltip?: TooltipOverriddenProps;
  };

  /** Number of characters to show at the end*/
  trailingLength?: number;

  /** The main string value to display (e.g., an identifier or long string) */
  value?: string;
};

export type IdentifierBaseProps = ElementBaseProps<'div', IdentifierOwnProps>;

export type IdentifierOverriddenProps = OverridableType<
  IdentifierBaseProps,
  IdentifierOverrides,
  never
>;

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
export const IdentifierBase = ({
  copyable,
  fallback,
  href,
  loading,
  qrcode,
  slots,
  trailingLength = 5,
  value = '',
  ...rest
}: IdentifierOverriddenProps) => {
  const [open, setOpen] = useState(false);

  const hasValue = Boolean(value);

  const hasFallback = !hasValue && Boolean(fallback);

  const hasActions =
    (hasValue || hasFallback) &&
    Boolean(copyable || href || qrcode) &&
    !loading;

  const disableActions = hasFallback || !hasValue || loading;

  const leading = hasFallback
    ? fallback
    : (value ?? '').slice(0, -trailingLength);

  const trailing = (value ?? '').slice(-trailingLength);

  return (
    <Root {...rest}>
      {loading && <Skeleton attached />}
      <Tooltip disabled={loading} title={value} {...slots?.tooltip}>
        <div className="value">
          <Typography
            className="leading"
            component="div"
            noWrap
            {...slots?.text}
            {...slots?.leading}
          >
            {leading}
          </Typography>
          <Typography
            className="trailing"
            component="div"
            {...slots?.text}
            {...slots?.trailing}
          >
            {trailing}
          </Typography>
        </div>
      </Tooltip>
      {hasActions && (
        <div className="actions">
          {copyable && (
            <CopyButton
              disabled={disableActions}
              size="small"
              value={value}
              slots={{ icon: { size: 'small' } }}
            />
          )}
          {href && (
            <IconButton
              disabled={disableActions}
              href={href}
              size="small"
              target="_blank"
            >
              <Icon name="ExternalLinkAlt" size="small" />
            </IconButton>
          )}
          {qrcode && (
            <>
              <IconButton
                disabled={disableActions}
                size="small"
                onClick={() => setOpen(true)}
              >
                <Icon name="Qrcode" size="small" />
              </IconButton>
              <QrCodeDialog
                open={open}
                value={value}
                onClose={() => setOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </Root>
  );
};

IdentifierBase.displayName = 'Identifier';

export const Identifier = Wrap(IdentifierBase);

export type IdentifierProps = ComponentProps<typeof Identifier>;
