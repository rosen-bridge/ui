import { FC, ReactNode } from 'react';

import {
  Card,
  CardActions,
  CardActionsProps,
  CardContent,
  CardContentProps,
} from '@mui/material';

import { CardHeader, CardHeaderProps } from './CardHeader';

export interface FullCardProps {
  headerProps?: CardHeaderProps;
  headerActions?: ReactNode;
  title?: string;
  children?: ReactNode;
  contentProps?: CardContentProps;
  backgroundColor?: string;
  cardActions?: ReactNode;
  cardActionProps?: CardActionsProps;
}

/**
 * This component is a React Material UI Card component that
 * can render different things depending on the passed props.
 *
 *  @param {string} title - an optional title to show in the card header,
 *  @param {ReactNode} children - main content to show in the card body
 *  @param {string} backgroundColor - an optional background color for the card,
 *  @param {ReactNode} headerActions- optional actions to render at the end of card header
 *  @param {ReactNode} cardActions- optional actions to render on the card
 *  @param {CardContentProps} headerProps - optional object to customize card content
 *  @param {CardContentProps} contentProps - optional object to customize card content
 *  @param {CardActionsProps} cardActionsProps- optional object to customize header actions
 */

export const FullCard: FC<FullCardProps> = (props) => {
  const {
    title,
    children,
    backgroundColor,
    headerActions,
    headerProps,
    contentProps,
    cardActions,
    cardActionProps,
  } = props;

  const renderCardActions = () => (
    <CardActions {...(cardActionProps ? cardActionProps : {})}>
      {cardActions}
    </CardActions>
  );

  return (
    <Card
      sx={{
        bgcolor: backgroundColor,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={title}
        {...(headerActions ? { action: headerActions } : {})}
        {...(headerProps ? headerProps : {})}
      />
      <CardContent
        sx={{ flexGrow: 1, pt: 0, pb: 1 }}
        {...(contentProps ? contentProps : {})}
      >
        {children}
      </CardContent>
      {cardActions && renderCardActions()}
    </Card>
  );
};

export default FullCard;
