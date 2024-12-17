import React from 'react';

import { useIsMobile } from '../../hooks';
import { isLegacyTheme, useTheme } from '../../hooks/useTheme';
import { styled } from '../../styling';
import { Typography, Stack, Grid } from '../base';

/**
 * adds basic styling to the component and hides the actions
 * in tablet and mobile devices
 */
const Header = styled('div')(({ theme }) => ({
  marginBottom: isLegacyTheme(theme) ? theme.spacing(3) : theme.spacing(4),
  marginTop: isLegacyTheme(theme) ? theme.spacing(2) : 0,
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
  toolbarActions?: React.ReactNode;
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

  const theme = useTheme();
  const textAlign = isCentered ? 'center' : 'inherit';

  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <div className="toolbar">
        <Stack direction="row">{toolbarActions}</Stack>
      </div>
    );

  return (
    <Header>
      <Grid container alignItems={isLegacyTheme(theme) ? 'stretch' : 'center'}>
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
