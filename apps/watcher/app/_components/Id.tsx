import { Typography } from '@rosen-bridge/ui-kit';

interface IdProps {
  id: string;
}
/**
 * render some starting and ending characters of an id and showing ellipsis in
 * the middle
 * @param id
 */
const Id = ({ id }: IdProps) => (
  <Typography noWrap variant="caption">{`${id.slice(0, 8)}...${id.slice(
    -8
  )}`}</Typography>
);

export default Id;
