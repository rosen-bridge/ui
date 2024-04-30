import { Typography } from '../base';

export interface IdProps {
  id: string;
  indicator?: 'middle';
}
/**
 * render some starting and ending characters of an id and showing ellipsis in
 * the middle
 * @param id
 */
export const Id = ({ id, indicator }: IdProps) => {
  let text = id.slice(0, 10);

  if (indicator == 'middle') {
    text += '...' + id.slice(-8);
  }

  return (
    <Typography noWrap variant="caption">
      {text}
    </Typography>
  );
};
