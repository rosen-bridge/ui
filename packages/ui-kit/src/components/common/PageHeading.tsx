import { FC, ReactNode } from 'react';

import { styled } from '../../styling';
import { Typography } from '../base';

const Root = styled('div', {
  name: 'RosenPageHeading',
  slot: 'root',
})(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  minHeight: theme.spacing(5),
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('tablet')]: {
    marginBottom: theme.spacing(2),
  },
}));

const HeadingContainer = styled('div', {
  name: 'RosenPageHeading',
  slot: 'heading',
})(({ theme }) => ({
  flexGrow: 1,
  textAlign: 'left',
  [theme.breakpoints.down('tablet')]: {
    textAlign: 'center',
  },
}));

const ActionsContainer = styled('div', {
  name: 'RosenPageHeading',
  slot: 'actions',
})(({ theme }) => ({
  [theme.breakpoints.down('tablet')]: {
    position: 'absolute',
    right: 0,
  },
}));

interface PageHeadingProps {
  title: string;
  actions?: ReactNode;
}

export const PageHeading: FC<PageHeadingProps> = ({ actions, title }) => {
  return (
    <Root>
      <HeadingContainer>
        <Typography variant="h1">{title}</Typography>
      </HeadingContainer>
      <ActionsContainer>{actions}</ActionsContainer>
    </Root>
  );
};
