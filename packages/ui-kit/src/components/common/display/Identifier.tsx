import { ExternalLinkAlt, Qrcode } from '@rosen-bridge/icons';

import { styled } from '../../../styling';
import { IconButton, Skeleton, SvgIcon, Tooltip } from '../../base';
import { CopyButton } from '../button/CopyButton';

interface IdentifierProps {
  value: string;
  title?: string;
  loading?: boolean;
  href?: string;
  copyable?: boolean;
  qrcode?: boolean;
}

const trailingLength = 5; // Number of characters to show at the end

const Root = styled('div')(() => ({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'nowrap',
  fontFamily: 'monospace',
}));

const ValueContainer = styled('span')(() => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  flex: '1 1 auto',
}));

const ActionContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  transform: 'translateY(4px)',
  flex: '0 0 auto',
  marginLeft: '0.25rem',
}));

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
    <Tooltip placement="top" title={value} arrow>
      <Root>
        <ValueContainer>{value.slice(0, -trailingLength)}</ValueContainer>
        <span>{value.slice(-trailingLength)}</span>
        <ActionContainer>
          {href && (
            <IconButton size="small" href={href}>
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
        </ActionContainer>
      </Root>
    </Tooltip>
  );
};
