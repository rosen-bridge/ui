import { useState } from 'react';

import {
  CopyButton,
  Icon,
  IconButton,
  QrCodeDialog,
  Skeleton,
  Text,
  type TextProps,
  Tooltip,
  type TooltipProps,
} from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
    leading?: TextProps;
    text?: TextProps;
    trailing?: TextProps;
    tooltip?: TooltipProps;
  };

  /** Number of characters to show at the end*/
  trailingLength?: number;

  /** The main string value to display (e.g., an identifier or long string) */
  value?: string;

  // THIS SHOULD BE REMOVED AFTER UPGRADE GUARD AND WATCHER APPS
  variant?: 'legacy' | 'legacy-middle';
};

export type IdentifierBaseProps = ElementBaseProps<'div', IdentifierOwnProps>;

export type IdentifierProps = OverridableType<IdentifierBaseProps, IdentifierOverrides, never>;

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
export const Identifier = (props: IdentifierProps) => {
  const {
    copyable,
    fallback,
    href,
    loading,
    qrcode,
    slots,
    trailingLength = 5,
    value = '',
    variant,
    ...rest
  } = useConfig('Identifier', props);

  const [open, setOpen] = useState(false);

  const hasValue = Boolean(value);

  const hasFallback = !hasValue && Boolean(fallback);

  const hasActions = (hasValue || hasFallback) && Boolean(copyable || href || qrcode) && !loading;

  const disableActions = hasFallback || !hasValue || loading;

  const leading = hasFallback ? fallback : (value ?? '').slice(0, -trailingLength);

  const trailing = (value ?? '').slice(-trailingLength);

  // THIS SHOULD BE REMOVED AFTER UPGRADE GUARD AND WATCHER APPS
  if (variant) {
    let text = value.slice(0, 10);

    if (variant === 'legacy-middle') {
      text += `...${value.slice(-8)}`;
    }

    return (
      <Tooltip title={value}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Text style={{ whiteSpace: 'nowrap' }} as="span">
              {text}
            </Text>
            <Icon
              color="primary"
              name="ExternalLinkAlt"
              style={{ display: 'block', fontSize: 'inherit' }}
            />
          </a>
        ) : (
          <Text style={{ whiteSpace: 'nowrap' }}>{text}</Text>
        )}
      </Tooltip>
    );
  }

  return (
    <div {...rest}>
      {loading && <Skeleton attached />}
      <Tooltip disabled={loading} title={value} {...slots?.tooltip}>
        <div className="RosenIdentifier-value">
          <span className="RosenIdentifier-overlay" aria-hidden="true">
            {value}
          </span>
          <Text
            className="RosenIdentifier-leading"
            as="div"
            variant="code2"
            truncate
            {...slots?.text}
            {...slots?.leading}
          >
            {leading}
          </Text>
          <Text
            className="RosenIdentifier-trailing"
            as="div"
            variant="code2"
            {...slots?.text}
            {...slots?.trailing}
          >
            {trailing}
          </Text>
        </div>
      </Tooltip>
      {hasActions && (
        <div className="RosenIdentifier-actions">
          {href && (
            <IconButton disabled={disableActions} href={href} size="small" target="_blank">
              <Icon name="ExternalLinkAlt" size="small" />
            </IconButton>
          )}
          {copyable && (
            <CopyButton
              disabled={disableActions}
              size="small"
              value={value}
              slots={{ icon: { size: 'small' } }}
            />
          )}
          {qrcode && (
            <>
              <IconButton disabled={disableActions} size="small" onClick={() => setOpen(true)}>
                <Icon name="Qrcode" size="small" />
              </IconButton>
              <QrCodeDialog open={open} value={value} onClose={() => setOpen(false)} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

Identifier.displayName = 'Identifier';
