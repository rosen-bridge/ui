import { OpenInNew } from '@rosen-bridge/icons';

import { Typography, Tooltip } from '../base';
import { SvgIcon } from '../base/SvgIcon';

export interface IdProps {
  id: string;
  indicator?: 'middle';
  href?: string | null;
}
/**
 * render some starting and ending characters of an id and showing ellipsis in
 * the middle
 * @param id
 */
export const Id = ({ id, indicator, href }: IdProps) => {
  let text = id.slice(0, 10);

  if (indicator == 'middle') {
    text += '...' + id.slice(-8);
  }

  return (
    <Tooltip placement="top" title={id} arrow>
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
          <Typography noWrap variant="caption" component="span">
            {text}
          </Typography>
          <SvgIcon
            fontSize="inherit"
            sx={{
              display: 'block',
              color: (theme) => theme.palette.primary.main,
            }}
          >
            <OpenInNew />
          </SvgIcon>
        </a>
      ) : (
        <Typography noWrap variant="caption">
          {text}
        </Typography>
      )}
    </Tooltip>
  );
};
