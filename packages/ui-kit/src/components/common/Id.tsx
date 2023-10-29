import { Typography } from '../base';

export interface IdProps {
  id: string;
}
/**
 * render some starting and ending characters of an id and showing ellipsis in
 * the middle
 * @param id
 */
export const Id = ({ id }: IdProps) => (
  <Typography noWrap variant="caption">{`${id.slice(0, 8)}...${id.slice(
    -8,
  )}`}</Typography>
);
