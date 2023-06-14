import { Card } from '../base';
import { styled } from '../../styling';

interface StyledCardProps {
  color?: string;
}

const WidgetCardBase = styled(Card)<StyledCardProps>(({ theme, ...props }) => ({
  padding: theme.spacing(2),
  backgroundColor: props.color,
}));

export default WidgetCardBase;
