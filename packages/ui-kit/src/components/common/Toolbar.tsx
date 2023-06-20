import { ReactNode } from 'react';

import { Typography, Stack, Grid } from '../base';

import { styled } from '../../styling';

interface ToolbarActions {
  children: ReactNode;
}

/**
 * takes a react node as child and renders it in stack
 *
 * @param children - react node to be rendered in the stack
 */
export const ToolbarActions: React.FC<ToolbarActions> = (props) => {
  const { children } = props;

  return (
    <div className="toolbar">
      <Stack direction="row">{children}</Stack>
    </div>
  );
};

const Header = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(2),

  [theme.breakpoints.down('tablet')]: {
    '& .toolbar': {
      display: 'none',
    },
  },
}));

export interface ToolbarProps {
  title: string;
  description: string;
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

  const renderActions = () => (
    <ToolbarActions> {toolbarActions} </ToolbarActions>
  );

  return (
    <Header>
      <Grid flexGrow={1} {...(isCentered ? { justifyContent: 'center' } : {})}>
        <Typography variant="h1">{title}</Typography>
        <Typography color="textSecondary">{description}</Typography>
      </Grid>
      {toolbarActions && renderActions()}
    </Header>
  );
};
