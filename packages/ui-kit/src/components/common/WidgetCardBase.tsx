import { Card } from '../base';
import { styled } from '../../styling';

interface StyledCardProps {
  color?: string;
}

/**
 * renders a wrapper for the widget components to
 * keep the  widgets base layout consistent
 *
 * @param color: the background color of the widget, can be any valid color
 */

const WidgetCardBase = styled(Card)<StyledCardProps>(({ theme, ...props }) => ({
  padding: theme.spacing(2),
  backgroundColor: props.color,
}));

export default WidgetCardBase;
