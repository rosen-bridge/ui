import { useState } from 'react';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../base';
import { Popup } from './Popup';
import { Input, Selected } from './types';

export type PickerProps = {
  anchorEl?: HTMLElement | null;
  open?: boolean;
  value?: Input;
  onSelect: (value: Selected['value']) => void;
};

export const Picker = ({ anchorEl, open, value, onSelect }: PickerProps) => {
  const [items, setItems] = useState(new Set<string>());

  if (!value) return null;

  return (
    <Popup anchorEl={anchorEl} open={open}>
      {value.type == 'multiple' && (
        <List>
          {value.options.map((option) => (
            <ListItem
              disablePadding
              key={option.value}
              onClick={() => {
                if (items.has(option.value)) {
                  items.delete(option.value);
                } else {
                  items.add(option.value);
                }

                const next = new Set(items);

                setItems(next);

                onSelect(Array.from(next.values()));
              }}
            >
              <ListItemButton>
                <ListItemText primary={option.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {value.type == 'select' && (
        <List>
          {value.options.map((option) => (
            <ListItem
              key={option.value}
              disablePadding
              secondaryAction={option.post}
            >
              <ListItemButton onClick={() => onSelect(option.value)}>
                {option.pre && <ListItemIcon>{option.pre}</ListItemIcon>}
                <ListItemText primary={option.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Popup>
  );
};
