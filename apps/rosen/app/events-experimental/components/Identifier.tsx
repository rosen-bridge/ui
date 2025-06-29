import { ExternalLinkAlt } from '@rosen-bridge/icons';
import { IconButton, Skeleton, styled, SvgIcon, Tooltip } from '@rosen-bridge/ui-kit';
import { CopyButton } from '@/events-experimental/components/CopyButton';



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
          <IconButton size="small" href={href}>
            <SvgIcon fontSize="small">
              <ExternalLinkAlt />
            </SvgIcon>
          </IconButton>
        )}
        {copyable && <CopyButton value={value} title={title} size="small" />}
        {/*{qrcode && (*/}
        {/*  <IconButton size="small">*/}
        {/*    <SvgIcon fontSize="small">*/}
        {/*      <Qrcode />*/}
        {/*    </SvgIcon>*/}
        {/*  </IconButton>*/}
        {/*)}*/}
      </Action>
    </Root>
  );
};
