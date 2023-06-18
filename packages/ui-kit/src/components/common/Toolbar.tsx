import { ReactNode } from 'react';

import { Box, Typography, Stack, IconButton } from '../base';

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
    <Box className="toolbar">
      <Stack direction="row">{children}</Stack>
    </Box>
  );
};

const Header = styled(Box)(({ theme }) => ({
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
  toolbarActions?: ReactNode;
}

/**
 *
 * @param title - layout title to be shown in the header
 * @param description - layout description to be shown in the header
 *
 * @param toolbarActions- react node to show at the end of the toolbar in the desktop.
 * the toolbar actions are not visible in mobile and tablet
 */

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { title, description, toolbarActions } = props;

  const renderActions = () => (
    <ToolbarActions> {toolbarActions} </ToolbarActions>
  );

  return (
    <Header>
      <Box flexGrow={1}>
        <Typography variant="h1">{title}</Typography>
        <Typography color="textSecondary">{description}</Typography>
      </Box>
      {toolbarActions && renderActions()}
    </Header>
  );
};
