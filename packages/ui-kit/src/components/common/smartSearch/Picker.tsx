import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../base';
import { Icon } from '../../icon';
import { Popup } from './Popup';
import type { Input, Selected, SelectOption } from './types';

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
  const lastMoveRef = useRef(0);

  const [indexSelected, setIndexSelected] = useState(-1);

  const [items, setItems] = useState(
    new Set<string | number | boolean | null>(),
  );

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const options = useMemo<SelectOption[]>(() => {
    if (!value) return [];

    if (value.type !== 'multiple' && value.type !== 'select') return [];

    if (!query) return value.options;

    return value.options.filter((option) =>
      option.label?.toString().toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, value]);

  const apply = useCallback(() => {
    switch (value?.type) {
      case 'multiple': {
        setItems(new Set());

        const next = Array.from(items.values());

        onSelect?.(next);

        break;
      }
    }
  }, [items, value, onSelect]);

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
    apply();
    onClose?.();
  }, [apply, onClose]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!value) return;

      const now = Date.now();

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (now - lastMoveRef.current < 150) return;
        lastMoveRef.current = now;
        event.preventDefault();
      }

      const key = `${event.key}:${value.type}`;

      switch (key) {
        case 'ArrowLeft:multiple':
        case 'ArrowRight:multiple': {
          apply();
          break;
        }
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
          if (indexSelected === -1) break;
          event.stopPropagation();
          handleClick(options[indexSelected]);
          break;
        }
        case 'Enter:number': {
          if (!query || Number.isNaN(Number(query))) break;
          event.stopPropagation();
          onSelect?.(Number(query));
          break;
        }
        case 'Enter:text': {
          if (!query) break;
          event.stopPropagation();
          onSelect?.(query);
          break;
        }
      }
    },
    [indexSelected, options, query, value, apply, handleClick, onSelect],
  );

  const setItemRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    void open;
    void query;

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
    if (value?.type === 'select' && value?.options.length === 1) {
      handleClick(value.options.at(0)!);
    }
  }, [value, handleClick]);

  useEffect(() => {
    if (indexSelected < 0) return;
    const el = itemRefs.current[indexSelected];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [indexSelected]);

  if (!value) return null;

  return (
    <Popup anchorEl={anchorEl} open={open} onFocusOut={handleFocusOut}>
      {(value.type === 'multiple' || value.type === 'select') && (
        <List>
          {options.map((option, index) => {
            const post = (() => {
              switch (value.type) {
                case 'multiple':
                  return items.has(option.value) && <Icon name="Check" />;
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
                  ref={setItemRef(index)}
                  selected={indexSelected === index}
                  onClick={() => handleClick(option)}
                >
                  {value.type === 'select' && option.pre && (
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
