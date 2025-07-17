import { ExternalLinkAlt, Qrcode } from '@rosen-bridge/icons';

import { styled } from '../../../styling';
import { IconButton, Skeleton, SvgIcon, Tooltip } from '../../base';
import { CopyButton } from '../button/CopyButton';

type IdentifierProps = {
  /** The main string value to display (e.g., an identifier or long string) */
  value: string;

  /** Tooltip text shown when hovering over the value */
  title?: string;

  /** If true, shows a loading skeleton instead of the value */
  loading?: boolean;

  /** If provided, renders an external link that opens in a new tab */
  href?: string;

  /** If true, enables a button to copy the value to the clipboard */
  copyable?: boolean;

  /** If true, displays a QR code icon */
  qrcode?: boolean;
};

const trailingLength = 5; // Number of characters to show at the end

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'nowrap',
  fontFamily: 'monospace',
}));

const Value = styled('div')(() => ({
  'display': 'flex',
  'alignItems': 'baseline',
  'overflow': 'hidden',
  'flex': '1 1 auto',
  '& > span:first-of-type': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: '1 1 auto',
  },
}));

const Action = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  transform: 'translateY(4px)',
  flex: '0 0 auto',
  marginLeft: '0.25rem',
}));

/**
 * Identifier component displays a formatted string with optional helper actions.
 *
 * It truncates the value, preserving the last few characters,
 * and can show an external link (opens in new tab), a copy button, and a QR code icon.
 *
 * @example
 * ```tsx
 * <Identifier
 *   value="0x123456789abcdef"
 *   href="https://example.com/details/0x123456789abcdef"
 *   copyable
 *   qrcode
 * />
 * ```
 */
export const Identifier = ({
  value,
  title,
  loading,
  href,
  copyable,
  qrcode,
}: IdentifierProps) => {
  if (loading)
    return (
      <Root>
        <Skeleton sx={{ flexGrow: 1 }} />
      </Root>
    );
  return (
    <Root>
      <Tooltip title={value}>
        <Value>
          <span>{value.slice(0, -trailingLength)}</span>
          <span>{value.slice(-trailingLength)}</span>
        </Value>
      </Tooltip>

      <Action>
        {href && (
          <IconButton target="_blank" size="small" href={href}>
            <SvgIcon fontSize="small">
              <ExternalLinkAlt />
            </SvgIcon>
          </IconButton>
        )}
        {copyable && <CopyButton value={value} title={title} size="small" />}
        {qrcode && (
          <IconButton size="small">
            <SvgIcon fontSize="small">
              <Qrcode />
            </SvgIcon>
          </IconButton>
        )}
      </Action>
    </Root>
  );
};
