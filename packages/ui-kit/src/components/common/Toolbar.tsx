import { ReactNode } from 'react';

import { Typography, Stack, Grid } from '../base';

import { styled } from '../../styling';

/**
 * adds basic styling to the component and hides the actions
 * in tablet and mobile devices
 */
const Header = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('tablet')]: {
    '& .toolbar': {
      display: 'none',
    },
  },
}));

export interface ToolbarProps {
  title: string;
  description?: string;
  isCentered?: boolean;
  toolbarActions?: ReactNode;
}

/**
 *
 * @param title - layout title to be shown in the header
 * @param description - layout description to be shown in the header
 * @param isCentered- if true, the title and description will be rendered in the center of the toolbar
 * @param toolbarActions- react node to show at the end of the toolbar in the desktop.
 * the toolbar actions are not visible in mobile and tablet
 */

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { title, description, toolbarActions, isCentered } = props;

  const textAlign = isCentered ? 'center' : 'inherit';

  return (
    <Header>
      <Grid container alignItems="center">
        <Grid
          flexGrow={1}
          {...(isCentered ? { justifyContent: 'center' } : {})}
        >
          <Typography variant="h1" textAlign={textAlign}>
            {title}
          </Typography>
        </Grid>
        {toolbarActions && (
          <Grid>
            <div className="toolbar">
              <Stack direction="row">{toolbarActions}</Stack>
            </div>
          </Grid>
        )}
      </Grid>
      {description && (
        <Typography color="textSecondary" textAlign={textAlign}>
          {description}
        </Typography>
      )}
    </Header>
  );
};
