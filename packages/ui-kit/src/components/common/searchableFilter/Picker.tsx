import { styled } from '../../../styling';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../base';
import { Input, Selected } from './types';

const PickerRoot = styled('div')(() => ({
  'border': '1px solid lightgray',
  'borderRadius': 1,
  'background': 'white',
  '.MuiListItem-root': {
    padding: '0.25rem',
  },
  '.MuiListItemButton-root': {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

export type PickerProps = {
  value: Input;
  onSelect: (value: Selected['value']) => void;
};

export const Picker = ({ value, onSelect }: PickerProps) => {
  if (value.type == 'multiple') {
    return (
      <PickerRoot>
        <List>
          {value.options.map((option) => (
            <ListItem
              key={option.value}
              onClick={() => onSelect([option.value])}
            >
              <ListItemButton>
                <ListItemText primary={option.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </PickerRoot>
    );
  }
  if (value.type == 'select') {
    return (
      <PickerRoot>
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
      </PickerRoot>
    );
  }
  return null;
};
