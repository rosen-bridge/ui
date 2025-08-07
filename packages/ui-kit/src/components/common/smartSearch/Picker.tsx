import { useCallback, useEffect, useMemo, useState } from 'react';

import { Check } from '@rosen-bridge/icons';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SvgIcon,
} from '../../base';
import { Popup } from './Popup';
import { Input, SelectOption, Selected } from './types';

export type PickerProps = {
  anchorEl?: HTMLInputElement | null;
  open?: boolean;
  query?: string;
  value?: Input;
  onClose?: () => void;
  onSelect?: (value: Selected['value']) => void;
};

export const Picker = ({
  anchorEl,
  open,
  query,
  value,
  onClose,
  onSelect,
}: PickerProps) => {
  const [indexSelected, setIndexSelected] = useState(-1);

  const [items, setItems] = useState(
    new Set<string | number | boolean | null>(),
  );

  const options = useMemo<SelectOption[]>(() => {
    if (!value) return [];

    if (value.type != 'multiple' && value.type != 'select') return [];

    if (!query) return value.options;

    return value.options.filter((option) => {
      return option.value
        ?.toString()
        .toLowerCase()
        .includes(query.toLowerCase());
    });
  }, [query, value]);

  const handleClick = useCallback(
    (option: SelectOption) => {
      switch (value?.type) {
        case 'multiple': {
          setIndexSelected(options.indexOf(option));

          if (items.has(option.value)) {
            items.delete(option.value);
          } else {
            items.add(option.value);
          }

          const next = new Set(items);

          setItems(next);

          break;
        }
        case 'select': {
          setIndexSelected(-1);

          onSelect?.(option.value);

          break;
        }
      }
    },
    [items, options, value, onSelect],
  );

  const handleFocusOut = useCallback(() => {
    switch (value?.type) {
      case 'multiple': {
        setItems(new Set());

        const next = Array.from(items.values());

        onSelect?.(next);

        break;
      }
    }
    onClose?.();
  }, [items, value, onClose, onSelect]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!value) return;

      const key = event.key + ':' + value.type;

      switch (key) {
        case 'ArrowDown:multiple':
        case 'ArrowDown:select': {
          setIndexSelected(
            options.length > indexSelected + 1 ? indexSelected + 1 : 0,
          );
          break;
        }
        case 'ArrowUp:multiple':
        case 'ArrowUp:select': {
          setIndexSelected(
            0 < indexSelected ? indexSelected - 1 : options.length - 1,
          );
          break;
        }
        case 'Enter:multiple':
        case 'Enter:select': {
          if (indexSelected != -1) {
            handleClick(options[indexSelected]);
          }
          break;
        }
        case 'Enter:number': {
          query && !isNaN(Number(query)) && onSelect?.(Number(query));
          break;
        }
        case 'Enter:text': {
          query && onSelect?.(query);
          break;
        }
      }
    },
    [indexSelected, options, query, value, handleClick, onSelect],
  );

  useEffect(() => {
    setIndexSelected(-1);
  }, [open, query]);

  useEffect(() => {
    if (!anchorEl) return;

    anchorEl.addEventListener('keydown', handleKeyDown);

    return () => {
      anchorEl.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorEl, handleKeyDown]);

  useEffect(() => {
    if (value?.type == 'select' && value?.options.length == 1) {
      handleClick(value.options.at(0)!);
    }
  }, [value, handleClick]);

  if (!value) return null;

  return (
    <Popup anchorEl={anchorEl} open={open} onFocusOut={handleFocusOut}>
      {(value.type == 'multiple' || value.type == 'select') && (
        <List>
          {options.map((option, index) => {
            const post = (() => {
              switch (value.type) {
                case 'multiple':
                  return (
                    <SvgIcon>{items.has(option.value) && <Check />}</SvgIcon>
                  );
                case 'select':
                  return option.post;
              }
            })();

            return (
              <ListItem
                key={`${option.value}`}
                disablePadding
                secondaryAction={post}
              >
                <ListItemButton
                  selected={indexSelected == index}
                  onClick={() => handleClick(option)}
                >
                  {value.type == 'select' && option.pre && (
                    <ListItemIcon>{option.pre}</ListItemIcon>
                  )}
                  <ListItemText primary={option.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Popup>
  );
};
