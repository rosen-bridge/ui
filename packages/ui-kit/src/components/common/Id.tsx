import { Icon } from '../icon';
import { Tooltip } from '../tooltip';
import { Typography } from '../typography';

export interface IdProps {
  id: string;
  indicator?: 'middle';
  href?: string;
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
    <Tooltip title={id}>
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
          <Icon
            color="primary"
            name="ExternalLinkAlt"
            style={{ display: 'block', fontSize: 'inherit' }}
          />
        </a>
      ) : (
        <Typography noWrap variant="caption">
          {text}
        </Typography>
      )}
    </Tooltip>
  );
};
