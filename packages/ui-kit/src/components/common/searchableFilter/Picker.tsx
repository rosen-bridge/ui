import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../base';
import { Input, Selected } from './types';

export type PickerProps = {
  value: Input;
  onSelect: (value: Selected['value']) => void;
};

export const Picker = ({ value, onSelect }: PickerProps) => {
  if (value.type == 'multiple') {
    return (
      <List>
        {value.options.map((option) => (
          <ListItem key={option.value} onClick={() => onSelect([option.value])}>
            <ListItemButton>
              <ListItemText primary={option.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }
  if (value.type == 'select') {
    return (
      <List>
        {value.options.map((option) => (
          <ListItem key={option.value}>
            <ListItemButton onClick={() => onSelect(option.value)}>
              {option.pre && <ListItemIcon>{option.pre}</ListItemIcon>}
              <ListItemText primary={option.label} />
              {option.post}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }
  return null;
};
