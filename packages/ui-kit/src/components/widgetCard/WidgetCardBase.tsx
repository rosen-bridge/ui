import React, { ReactNode } from 'react';

import { Card } from '../base';
import { styled } from '../../styling';

interface StyledCardProps {
  color?: string;
}

const WidgetCardBase = styled(Card)<StyledCardProps>(({ theme, ...props }) => ({
  padding: theme.spacing(2),
  backgroundColor: props.color,
}));

export interface WidgetCardBaseProps extends StyledCardProps {
  children: ReactNode;
}

const WidgetCard: React.FC<WidgetCardBaseProps> = (props) => {
  const { color = '#ffffff', children } = props;

  return <WidgetCardBase color={color}>{children}</WidgetCardBase>;
};

export default WidgetCard;
